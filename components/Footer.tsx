
import React, { useState } from 'react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: 'success' | 'error' } | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

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
        setMessage({ text: 'This email is already subscribed.', kind: 'success' });
      } else {
        setEmail('');
        setMessage({ text: 'Subscribed successfully. Thank you.', kind: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: err?.message ?? 'Failed to subscribe. Try again.', kind: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-black py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-4xl font-great-vibes">Odipo C. Odero</h3>
          <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
            Exploring the silence between words. A Nairobi-based author dedicated to literary intimacy and storytelling.
          </p>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs tracking-widest mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm uppercase tracking-wide">
            <li><a href="/#/books" className="hover:underline">Books</a></li>
            <li><a href="/#/recover" className="hover:underline">Access Your Books</a></li>
            <li><a href="/#/blog" className="hover:underline">Blog</a></li>
            <li><a href="/#/events" className="hover:underline">Events</a></li>
            <li><a href="/#/admin" className="hover:underline">Admin Login</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs tracking-widest mb-4">Newsletter</h4>
          <p className="text-sm mb-4">Subscribe for updates on new releases and events.</p>
          <form onSubmit={handleSubscribe}>
            <div className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="border border-black px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-6 py-2 uppercase text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Joining...' : 'Join'}
              </button>
            </div>
            {message && (
              <p
                className={`mt-2 text-xs font-bold ${message.kind === 'success' ? 'text-green-700' : 'text-red-600'}`}
              >
                {message.text}
              </p>
            )}
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 text-center text-[10px] uppercase tracking-widest text-gray-400">
        &copy; {new Date().getFullYear()} Odipo C. Odero. Built from scratch with precision.
      </div>
    </footer>
  );
};
