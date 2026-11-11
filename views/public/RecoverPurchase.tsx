import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { digitalAccessApi } from '../../services/digitalAccess';

export const RecoverPurchase: React.FC = () => {
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const normalizedReference = reference.trim();
      const normalizedEmail = email.trim().toLowerCase();
      const { token } = await digitalAccessApi.getAccessToken({
        reference: normalizedReference,
        email: normalizedEmail,
      });
      localStorage.setItem(
        'odero_reader_identity',
        JSON.stringify({
          ref: normalizedReference,
          email: normalizedEmail,
          savedAt: new Date().toISOString(),
        })
      );
      const params = new URLSearchParams({
        ref: normalizedReference,
        email: normalizedEmail,
      });
      navigate(`/read/${token}?${params.toString()}`);
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();
      if (msg.includes('failed to fetch') || msg.includes('could not reach get-access-token')) {
        setError('We could not reach the book server. Please check your internet and try again in a few seconds.');
      } else {
        setError(err?.message ?? 'Failed to recover purchase');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page grid max-w-5xl grid-cols-1 gap-14 pb-28 pt-14 md:grid-cols-2 md:pt-20">
      <div>
        <p className="eyebrow mb-5">Your library</p>
        <h1 className="font-serif text-5xl font-bold leading-[1.05]">
          Access your <span className="italic font-normal">books.</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-neutral-600">
          Enter the payment reference and the email address you used at checkout to open your book in the reader.
        </p>
        <ul className="mt-10 space-y-4 text-sm text-neutral-600">
          <li className="flex gap-3"><span className="font-serif italic text-neutral-400">01</span>Your reference was shown after payment and starts with <code className="bg-mist px-1.5 py-0.5 text-ink">book_</code>.</li>
          <li className="flex gap-3"><span className="font-serif italic text-neutral-400">02</span>Use the same email address you entered when you paid.</li>
          <li className="flex gap-3"><span className="font-serif italic text-neutral-400">03</span>Can&rsquo;t find your reference? <Link to="/contact" className="underline underline-offset-4 hover:text-ink">Contact us</Link> and we&rsquo;ll help.</li>
        </ul>
      </div>

      <form onSubmit={handleRecover} className="border border-ink p-7 sm:p-10">
        {error && <div className="alert-error mb-6" role="alert">{error}</div>}

        <div className="space-y-6">
          <div>
            <label htmlFor="ref" className="field-label">Payment reference</label>
            <input
              id="ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="field font-mono"
              placeholder="book_…"
              autoComplete="off"
              spellCheck={false}
              required
            />
          </div>

          <div>
            <label htmlFor="ref-email" className="field-label">Email address</label>
            <input
              id="ref-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-dark w-full">
            {isSubmitting ? 'Checking…' : 'Continue to reader'}
          </button>
        </div>
      </form>
    </div>
  );
};
