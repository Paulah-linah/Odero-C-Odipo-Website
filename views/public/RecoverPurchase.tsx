import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const params = new URLSearchParams({
        ref: normalizedReference,
        email: normalizedEmail,
      });
      navigate(`/read/${token}?${params.toString()}`);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to recover purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-24 px-6 md:px-12 max-w-2xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Access Your Book</h1>
      <p className="text-gray-600 mb-10">
        Enter the payment reference and the email you used during checkout.
      </p>

      <form onSubmit={handleRecover} className="bg-white border border-black p-8">
        {error && <div className="bg-red-50 text-red-600 p-3 text-xs mb-6 font-bold">{error}</div>}

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Payment Reference</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full border border-black p-3 focus:outline-none"
              placeholder="e.g. book_<id>_123456789"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black p-3 focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 uppercase text-xs font-bold tracking-widest hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Checking...' : 'Continue to Reader'}
          </button>
        </div>
      </form>
    </div>
  );
};
