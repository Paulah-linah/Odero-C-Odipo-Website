import React from 'react';
import { Link } from 'react-router-dom';
import { NewsletterForm } from './NewsletterForm';

const links = [
  { name: 'Books', path: '/books' },
  { name: 'Access your books', path: '/recover' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Events', path: '/events' },
  { name: 'Contact', path: '/contact' },
];

export const Footer: React.FC = () => (
  <footer className="bg-ink text-white">
    <div className="page grid grid-cols-1 gap-14 py-20 md:grid-cols-12">
      <div className="md:col-span-5">
        <Link to="/" className="font-script text-5xl leading-none">Odipo C. Odero</Link>
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
          Exploring the silence between words. A Nairobi-based author dedicated to literary intimacy and storytelling.
        </p>
      </div>

      <div className="md:col-span-3">
        <h3 className="mb-5 font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">Explore</h3>
        <ul className="space-y-3 text-sm">
          {links.map((l) => (
            <li key={l.path}>
              <Link to={l.path} className="text-white/80 transition-colors hover:text-white">{l.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-4">
        <h3 className="mb-5 font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">Newsletter</h3>
        <p className="mb-5 text-sm leading-relaxed text-white/70">New releases, essays and events — straight to your inbox.</p>
        <NewsletterForm variant="dark" />
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="page flex flex-col items-center justify-between gap-3 py-6 text-[11px] uppercase tracking-[0.2em] text-white/40 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} Odipo C. Odero</span>
        <Link to="/admin" className="transition-colors hover:text-white">Admin</Link>
      </div>
    </div>
  </footer>
);
