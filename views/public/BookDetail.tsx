import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Book } from '../../types';
import { booksApi } from '../../services/books';
import { supabase } from '../../services/supabaseClient';
import { startPaystackCheckout } from '../../services/paystack';
import { BookCover } from '../../components/BookCover';

const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

/** Shared checkout dialog frame. */
const Dialog: React.FC<{ title: string; step?: string; onClose: () => void; children: React.ReactNode }> = ({ title, step, onClose, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-7 flex items-start justify-between gap-6">
          <div>
            {step && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">{step}</p>}
            <h2 className="font-serif text-2xl font-bold">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 grid h-9 w-9 place-items-center text-xl text-neutral-400 hover:text-ink">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode; strong?: boolean }> = ({ label, children, strong }) => (
  <div className={`flex items-center justify-between gap-4 border-b border-neutral-200 py-3 ${strong ? 'text-lg' : ''}`}>
    <span className="text-neutral-500">{label}</span>
    <span className="text-right font-semibold">{children}</span>
  </div>
);

export const BookDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showMpesa, setShowMpesa] = useState(false);
  const [showBuyerInfo, setShowBuyerInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [paymentReference, setPaymentReference] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      if (!slug) {
        setBook(null);
        setIsLoading(false);
        return;
      }

      setError('');
      setIsLoading(true);
      try {
        // Show the book instantly if we already loaded the catalogue on a previous page.
        const cached = await booksApi.peekBySlug(slug);
        if (cached && mounted) {
          setBook(cached);
          setIsLoading(false);
        }
        const found = await booksApi.getBySlug(slug);
        if (!mounted) return;
        setBook(found);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load book');
        setBook(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    refresh();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (book) document.title = `${book.title} | Odipo C. Odero`;
    return () => {
      document.title = 'Odipo C. Odero | Author';
    };
  }, [book]);

  if (isLoading && !book) {
    return (
      <div className="page grid grid-cols-1 gap-14 py-16 md:py-24 lg:grid-cols-12" aria-busy="true">
        <div className="lg:col-span-5"><div className="skeleton mx-auto aspect-[2/3] w-full max-w-md" /></div>
        <div className="space-y-5 lg:col-span-6 lg:col-start-7 lg:pt-10">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-14 w-3/4" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton mt-8 h-12 w-48" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="page py-32 text-center">
        <p className="eyebrow mb-5 justify-center">Not found</p>
        <h1 className="font-serif text-4xl font-bold">{error ? 'We couldn’t load this book.' : 'This book isn’t on the shelf.'}</h1>
        {error && <p className="mt-4 text-neutral-500">{error}</p>}
        <Link to="/books" className="btn-dark mt-10">Browse all books</Link>
      </div>
    );
  }

  const totalAmount = book.price * quantity;
  const isComingSoon = book.status === 'Coming Soon';

  const handleBuyNow = () => {
    if (book?.status === 'Coming Soon') return;
    setQuantity(1);
    setBuyerPhone('');
    setBuyerEmail('');
    setPaymentMethod('mpesa');
    setPaymentReference('');
    setError('');
    setShowSummary(true);
  };

  const handleConfirmSummary = () => {
    setShowSummary(false);
    setShowMpesa(true);
  };

  const handleMpesaConfirm = () => {
    setShowMpesa(false);
    setShowBuyerInfo(true);
  };

  const handleSubmitPurchase = async () => {
    if (!book) return;
    if (!buyerEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (paymentMethod === 'mpesa' && !buyerPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const reference = `book_${book.id}_${Date.now()}`;
      const channels: Array<'card' | 'mobile_money'> = paymentMethod === 'mpesa' ? ['mobile_money'] : ['card'];

      const normalizedBuyerPhone = paymentMethod === 'mpesa' ? buyerPhone.trim() : '';
      const resp = await startPaystackCheckout({
        email: buyerEmail.trim(),
        amountKes: totalAmount,
        reference,
        channels,
        metadata: {
          book_id: book.id,
          book_title: book.title,
          quantity,
          unit_price: book.price,
          total_amount: totalAmount,
          buyer_phone: normalizedBuyerPhone,
          payment_method: paymentMethod,
        },
      });

      const paidRef = resp?.reference || reference;
      setPaymentReference(paidRef);

      const { error: insertError } = await supabase
        .from('purchases')
        .insert({
          book_id: book.id,
          book_title: book.title,
          buyer_phone: normalizedBuyerPhone,
          buyer_email: buyerEmail.trim(),
          quantity,
          unit_price: book.price,
          total_amount: totalAmount,
          status: 'pending',
          payment_method: paymentMethod,
          payment_reference: paidRef,
        });
      if (insertError) throw insertError;

      setShowBuyerInfo(false);
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err?.message || 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page pb-28 pt-10 md:pt-14">
      <nav aria-label="Breadcrumb" className="mb-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
        <Link to="/books" className="transition-colors hover:text-ink">← All books</Link>
      </nav>

      <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <BookCover
            src={book.coverImage}
            title={book.title}
            priority
            sizes="(max-width: 1024px) 90vw, 450px"
            className="mx-auto w-full max-w-md shadow-[0_40px_80px_-40px_rgba(0,0,0,.55)]"
          />
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
          <p className="eyebrow mb-6">{book.status}</p>
          <h1 className="text-balance font-serif text-5xl font-bold leading-[1.05] md:text-6xl">{book.title}</h1>
          <p className="mt-8 whitespace-pre-line text-lg italic leading-relaxed text-neutral-700 text-pretty">{book.synopsis}</p>

          <div className="mt-10 border-y border-neutral-200 py-8">
            {isComingSoon ? (
              <p className="font-serif text-2xl italic">Coming soon</p>
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-4xl font-bold">{formatKes(book.price)}</span>
                <span className="text-sm text-neutral-500">Digital edition</span>
              </div>
            )}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleBuyNow} disabled={isComingSoon} className="btn-dark sm:min-w-[14rem]">
                {isComingSoon ? 'Coming soon' : 'Buy now'}
              </button>
              {!isComingSoon && (
                <Link to="/recover" className="btn-light whitespace-nowrap">Read my copy</Link>
              )}
            </div>
            {!isComingSoon && (
              <p className="mt-5 text-xs text-neutral-500">Secure checkout with M-Pesa or Visa / Mastercard via Paystack.</p>
            )}
          </div>
        </div>
      </div>

      {/* Step 1 — Summary */}
      {showSummary && (
        <Dialog title="Your order" step="Step 1 of 3" onClose={() => setShowSummary(false)}>
          <div className="mb-8">
            <Row label="Book">{book.title}</Row>
            <Row label="Unit price">{formatKes(book.price)}</Row>
            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 py-3">
              <span className="text-neutral-500">Quantity</span>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid h-9 w-9 place-items-center border border-neutral-300 transition-colors hover:border-ink hover:bg-ink hover:text-white"
                >
                  −
                </button>
                <output aria-label="Quantity" className="w-12 text-center font-semibold">{quantity}</output>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="grid h-9 w-9 place-items-center border border-neutral-300 transition-colors hover:border-ink hover:bg-ink hover:text-white"
                >
                  +
                </button>
              </div>
            </div>
            <Row label="Total" strong>{formatKes(totalAmount)}</Row>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowSummary(false)} className="btn-light flex-1">Cancel</button>
            <button type="button" onClick={handleConfirmSummary} className="btn-dark flex-1">Continue</button>
          </div>
        </Dialog>
      )}

      {/* Step 2 — Payment method */}
      {showMpesa && (
        <Dialog title="How would you like to pay?" step="Step 2 of 3" onClose={() => setShowMpesa(false)}>
          <div className="mb-8 space-y-3">
            {([
              { id: 'mpesa', label: 'M-Pesa', note: 'Mobile money' },
              { id: 'card', label: 'Bank card', note: 'Visa / Mastercard' },
            ] as const).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setPaymentMethod(m.id);
                  handleMpesaConfirm();
                }}
                className="group flex w-full items-center justify-between border border-neutral-300 p-5 text-left transition-colors hover:border-ink hover:bg-ink hover:text-white"
              >
                <span>
                  <span className="block font-semibold">{m.label}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-neutral-500 group-hover:text-white/60">{m.note}</span>
                </span>
                <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">→</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setShowMpesa(false)} className="btn-light w-full">Cancel</button>
        </Dialog>
      )}

      {/* Step 3 — Buyer details */}
      {showBuyerInfo && (
        <Dialog title="Confirm your details" step="Step 3 of 3" onClose={() => setShowBuyerInfo(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitPurchase();
            }}
          >
            <div className="mb-6">
              <Row label="Book">{book.title}</Row>
              <Row label="Quantity">{quantity}</Row>
              <Row label="Payment">{paymentMethod === 'mpesa' ? 'M-Pesa' : 'Bank card'}</Row>
              <Row label="Total" strong>{formatKes(totalAmount)}</Row>
            </div>
            <div className="mb-6 space-y-5">
              <div>
                <label htmlFor="buyer-email" className="field-label">Email address</label>
                <input
                  id="buyer-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="field"
                  required
                />
                <p className="mt-2 text-xs text-neutral-500">You’ll use this email with your payment reference to open your book.</p>
              </div>
              {paymentMethod === 'mpesa' && (
                <div>
                  <label htmlFor="buyer-phone" className="field-label">M-Pesa phone number</label>
                  <input
                    id="buyer-phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="254712345678"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="field"
                    required
                  />
                </div>
              )}
            </div>

            {error && <div className="alert-error mb-5" role="alert">{error}</div>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowBuyerInfo(false)} className="btn-light flex-1">Back</button>
              <button type="submit" disabled={isSubmitting} className="btn-dark flex-[1.4]">
                {isSubmitting ? 'Processing…' : `Pay ${formatKes(totalAmount)}`}
              </button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Success */}
      {showSuccess && (
        <Dialog title="Thank you" onClose={() => setShowSuccess(false)}>
          <div className="text-center">
            <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-ink text-2xl text-white" aria-hidden="true">✓</div>
            <p className="mb-6 text-neutral-600">
              Payment for <span className="font-semibold text-ink">{book.title}</span> was received. Use your reference and email to open the reader.
            </p>
            {paymentReference && (
              <div className="mb-7 border border-neutral-200 bg-mist px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Your reference</p>
                <p className="mt-1 break-all font-mono text-sm font-semibold">{paymentReference}</p>
              </div>
            )}
            <div className="space-y-3">
              <button type="button" onClick={() => navigate('/recover')} className="btn-dark w-full">Open reader</button>
              <button type="button" onClick={() => setShowSuccess(false)} className="btn-light w-full">Return to site</button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
