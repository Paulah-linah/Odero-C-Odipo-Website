import React from 'react';

export const Maintenance: React.FC = () => {
  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-5xl font-serif font-bold italic mb-6">Maintenance</h1>
        <p className="text-gray-600 mb-8">
          The site is currently undergoing updates. Please check back shortly.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="/#/admin"
            className="bg-black text-white px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
          >
            Admin Login
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 text-sm uppercase tracking-widest font-bold border border-black hover:bg-black hover:text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};
