import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { digitalAccessApi } from '../../services/digitalAccess';

export const ReadBook: React.FC = () => {
  const { token } = useParams<{ token: string }>();

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

  const src = digitalAccessApi.getReadUrl(token);

  return (
    <div className="min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Reader</h1>
          <Link to="/recover" className="text-[10px] uppercase font-bold tracking-widest text-gray-600 hover:text-black">
            Recover another purchase
          </Link>
        </div>

        <div className="bg-white border border-black overflow-hidden" style={{ height: '75vh' }}>
          <iframe
            title="Book Reader"
            src={src}
            className="w-full h-full"
            referrerPolicy="no-referrer"
          />
        </div>

        <p className="mt-4 text-[11px] text-gray-500">
          Viewing is for personal use only. Sharing or redistribution is prohibited.
        </p>
      </div>
    </div>
  );
};
