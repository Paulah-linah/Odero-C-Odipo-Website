import React from 'react';
import { Link } from 'react-router-dom';

export const Maintenance: React.FC = () => (
  <div className="page flex min-h-[70vh] items-center justify-center py-24">
    <div className="max-w-xl text-center">
      <p className="eyebrow mb-6 justify-center">A short pause</p>
      <h1 className="font-serif text-5xl font-bold italic">We&rsquo;ll be right back.</h1>
      <p className="mt-6 text-lg text-neutral-600">The site is being updated. Please check back shortly.</p>
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={() => window.location.reload()} className="btn-dark">Try again</button>
        <Link to="/admin" className="btn-light">Admin login</Link>
      </div>
    </div>
  </div>
);
