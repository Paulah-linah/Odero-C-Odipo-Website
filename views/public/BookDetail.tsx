import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Book } from '../../types';
import { booksApi } from '../../services/books';
import { storage } from '../../services/storage';
import { supabase } from '../../services/supabaseClient';
import { startPaystackCheckout } from '../../services/paystack';

export const BookDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      if (!slug) {
        setBook(null);
        return;
      }

      setError('');
      setIsLoading(true);
      try {
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

  if (isLoading) return <div className="py-40 text-center font-serif text-2xl">Searching the archives...</div>;

  if (!book) {
    return (
      <div className="py-40 text-center font-serif text-2xl">
        {error || 'Book not found.'}
      </div>
    );
  }

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  const totalAmount = book.price * quantity;

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
    if (!buyerPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const reference = `book_${book.id}_${Date.now()}`;
      const channels = paymentMethod === 'mpesa' ? ['mobile_money'] : ['card'];

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
          buyer_phone: buyerPhone.trim(),
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
          buyer_phone: buyerPhone.trim(),
          buyer_email: buyerEmail.trim(),
          quantity,
          unit_price: book.price,
          total_amount: totalAmount,
          status: 'paid',
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
    <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full shadow-2xl border-8 border-white transition-all duration-500"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="uppercase tracking-[0.3em] text-xs font-bold text-gray-400 mb-4 block">{book.status}</span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">{book.title}</h1>
          <div className="prose prose-lg mb-10 text-gray-700 italic leading-relaxed">
            {book.synopsis}
          </div>
          <div className="mb-10 flex items-baseline gap-4">
            <span className="text-3xl font-bold">{formatKes(book.price)}</span>
            <span className="text-gray-400 line-through">{formatKes(book.price * 1.2)}</span>
          </div>
          <button 
            onClick={handleBuyNow}
            disabled={book.status === 'Coming Soon'}
            className={`px-12 py-5 uppercase text-sm tracking-widest font-bold border border-black transition-all ${
              book.status === 'Coming Soon'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-white hover:text-black'
            }`}
          >
            {book.status === 'Coming Soon' ? 'Coming Soon' : 'Buy Now'}
          </button>
        </div>
      </div>

      {/* Purchase Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="bg-white p-8 max-w-md w-full border-t-8 border-black shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-6">Purchase Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Book</span>
                <span className="font-bold">{book.title}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Unit Price</span>
                <span className="font-bold">{formatKes(book.price)}</span>
              </div>
              <div className="flex justify-between border-b pb-2 items-center">
                <span className="text-gray-500">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    readOnly
                    aria-label="Quantity"
                    value={quantity}
                    className="w-12 h-9 border border-black text-center focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="w-9 h-9 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between border-b pb-2 text-lg">
                <span className="text-gray-500 font-bold">Total</span>
                <span className="font-bold">{formatKes(totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="flex-1 border border-black py-3 uppercase text-xs font-bold tracking-widest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSummary}
                className="flex-1 bg-black text-white py-3 uppercase text-xs font-bold tracking-widest hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa Payment Instructions Popup */}
      {showMpesa && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="bg-white p-8 max-w-md w-full border-t-8 border-black shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-6">Choose Payment Method</h2>
            <div className="space-y-4 mb-8">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('mpesa');
                  handleMpesaConfirm();
                }}
                className={`w-full p-4 border-2 border-black flex items-center justify-between transition-colors ${
                  paymentMethod === 'mpesa' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                <span className="font-bold">M-Pesa (Paystack)</span>
                <span className="text-xs uppercase tracking-widest">Mobile Money</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('card');
                  handleMpesaConfirm();
                }}
                className={`w-full p-4 border-2 border-black flex items-center justify-between transition-colors ${
                  paymentMethod === 'card' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                <span className="font-bold">Bank Card (Paystack)</span>
                <span className="text-xs uppercase tracking-widest">Visa / Mastercard</span>
              </button>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowMpesa(false)}
                className="flex-1 border border-black py-3 uppercase text-xs font-bold tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Information Capture */}
      {showBuyerInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="bg-white p-8 max-w-md w-full border-t-8 border-black shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-6">Confirm Your Details</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Book</span>
                <span className="font-bold">{book.title}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Quantity</span>
                <span className="font-bold">{quantity}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold">{formatKes(totalAmount)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-bold">{paymentMethod === 'mpesa' ? 'M-Pesa' : 'Bank Card'}</span>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full border border-black p-3 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Phone Number (M-Pesa)</label>
                <input
                  type="tel"
                  placeholder="254712345678"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full border border-black p-3 focus:outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 text-xs font-bold mb-4">{error}</div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowBuyerInfo(false)}
                className="flex-1 border border-black py-3 uppercase text-xs font-bold tracking-widest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitPurchase}
                disabled={isSubmitting}
                className="flex-1 bg-black text-white py-3 uppercase text-xs font-bold tracking-widest hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : `Pay ${formatKes(totalAmount)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="bg-white p-8 max-w-md w-full border-t-8 border-black shadow-2xl text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">✓</span>
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-8">
              Your purchase for <span className="font-bold">{book.title}</span> has been recorded. Please complete payment via M-Pesa.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="w-full bg-black text-white py-4 uppercase text-xs font-bold tracking-widest"
            >
              Return to Site
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
