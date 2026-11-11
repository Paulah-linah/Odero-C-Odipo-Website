import React, { useState } from 'react';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

type Props = { variant?: 'light' | 'dark'; className?: string };

/** Newsletter sign-up used in the footer and on the blog. */
export const NewsletterForm: React.FC<Props> = ({ variant = 'light', className = '' }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: 'success' | 'error' } | null>(null);
  const dark = variant === 'dark';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      setMessage({ text: 'Enter a valid email address.', kind: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe-newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email: normalized }),
      });

      const raw = await res.text();
      let body: any = null;
      try {
        body = raw ? JSON.parse(raw) : null;
      } catch {
        body = null;
      }

      if (!res.ok) {
        throw new Error(body?.error || raw || `Subscription failed (${res.status})`);
      }

      if (body?.duplicate) {
        setMessage({ text: 'You’re already subscribed — thank you.', kind: 'success' });
      } else {
        setEmail('');
        setMessage({ text: 'Subscribed. Thank you for reading.', kind: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: err?.message ?? 'Failed to subscribe. Try again.', kind: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className={className} noValidate>
      <label htmlFor={`nl-${variant}`} className="sr-only">Email address</label>
      <div className={`flex border ${dark ? 'border-white/30 focus-within:border-white' : 'border-ink'} transition-colors`}>
        <input
          id={`nl-${variant}`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className={`min-w-0 flex-1 bg-transparent px-4 py-3 text-[15px] focus:outline-none ${
            dark ? 'text-white placeholder:text-white/40' : 'placeholder:text-neutral-400'
          }`}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`shrink-0 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors disabled:opacity-60 ${
            dark ? 'bg-white text-ink hover:bg-neutral-200' : 'bg-ink text-white hover:bg-neutral-800'
          }`}
        >
          {isSubmitting ? 'Joining…' : 'Subscribe'}
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-[1.25rem] text-xs ${
          message?.kind === 'error' ? (dark ? 'text-red-300' : 'text-red-600') : dark ? 'text-white/70' : 'text-neutral-600'
        }`}
      >
        {message?.text}
      </p>
    </form>
  );
};
