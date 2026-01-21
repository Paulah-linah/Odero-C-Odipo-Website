
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const brandText = 'Odipo C. Odero';

  const navLinks = [
    { name: 'Books', path: '/books' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-black py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          aria-label={brandText}
          className="text-3xl font-great-vibes leading-tight"
        >
          <span className="sr-only">{brandText}</span>
          <span aria-hidden="true" className="odipo-brand-typing">
            {brandText}
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8 items-center uppercase text-xs tracking-widest font-semibold">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`hover:text-gray-500 transition-colors ${location.pathname === link.path ? 'border-b-2 border-black pb-1' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/admin" className="ml-4 border border-black px-4 py-2 hover:bg-black hover:text-white transition-all text-[10px] tracking-[0.2em] font-bold">
            ADMIN
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-2xl">
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 flex flex-col items-center justify-center space-y-8 text-2xl font-serif">
          <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-3xl">✕</button>
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="mb-4 uppercase tracking-widest font-semibold text-2xl font-great-vibes"
          >
            {brandText}
          </Link>
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>{link.name}</Link>
          ))}
          <Link to="/admin" onClick={() => setIsOpen(false)} className="border border-black px-8 py-3 text-sm uppercase tracking-widest font-bold">Admin</Link>
        </div>
      )}
      <style>{`
        .odipo-brand-typing {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          clip-path: inset(0 100% 0 0);
          will-change: clip-path;
          animation: odipo-brand-typing-reveal 1.8s steps(14, end) 140ms both;
        }

        @keyframes odipo-brand-typing-reveal {
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .odipo-brand-typing {
            animation: none;
            clip-path: inset(0 0 0 0);
          }
        }
      `}</style>
    </nav>
  );
};
