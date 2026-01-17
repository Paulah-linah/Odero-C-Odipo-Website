
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
        <Link to="/" className="text-4xl font-signature leading-none">
          Odipo C. Odero
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
          <Link to="/" onClick={() => setIsOpen(false)} className="text-5xl font-signature mb-4">Odipo C. Odero</Link>
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>{link.name}</Link>
          ))}
          <Link to="/admin" onClick={() => setIsOpen(false)} className="border border-black px-8 py-3 text-sm uppercase tracking-widest font-bold">Admin</Link>
        </div>
      )}
    </nav>
  );
};
