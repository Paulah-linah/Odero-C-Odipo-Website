import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { digitalAccessApi } from '../../services/digitalAccess';

export const ReadBook: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();

  if (!token) {
    return (
      <div className="py-24 px-6 md:px-12 max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-4">Missing access token</h1>
        <Link to="/recover" className="text-sm font-bold uppercase tracking-widest text-blue-700">
          Recover purchase
        </Link>
      </div>
    );
  }

  const params = new URLSearchParams(location.search);
  const email = (params.get('email') || '').trim().toLowerCase();
  const reference = (params.get('ref') || '').trim();

  const maskEmail = (value: string) => {
    if (!value.includes('@')) return value;
    const [local, domain] = value.split('@');
    const safeLocal = local.length <= 2 ? `${local[0] || ''}*` : `${local.slice(0, 2)}***`;
    return `${safeLocal}@${domain}`;
  };

  const maskRef = (value: string) => {
    if (value.length <= 10) return value;
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  };

  const watermarkText = [maskEmail(email), maskRef(reference)].filter(Boolean).join(' | ');

  const src = `${digitalAccessApi.getReadUrl(token)}#toolbar=0&navpanes=0&scrollbar=0`;

  return (
    <div className="min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Reader</h1>
          <Link to="/recover" className="text-[10px] uppercase font-bold tracking-widest text-gray-600 hover:text-black">
            Recover another purchase
          </Link>
        </div>

        <div className="relative bg-white border border-black overflow-hidden" style={{ height: '75vh' }}>
          <iframe
            title="Book Reader"
            src={src}
            className="w-full h-full"
            referrerPolicy="no-referrer"
          />
          {watermarkText && (
            <div className="pointer-events-none absolute right-3 bottom-3 bg-white/65 border border-black/20 px-2 py-1 text-[9px] uppercase tracking-wider text-black/70">
              {watermarkText}
            </div>
          )}
        </div>

        <p className="mt-4 text-[11px] text-gray-500">
          Viewing is for personal use only. Sharing or redistribution is prohibited.
        </p>
      </div>
    </div>
  );
};
