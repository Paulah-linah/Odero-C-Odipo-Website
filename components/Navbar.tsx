import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const brandText = 'Odipo C. Odero';

const navLinks = [
  { name: 'Books', path: '/books' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Events', path: '/events' },
  { name: 'Contact', path: '/contact' },
];

/** Wait (briefly) for the script font so the name never swaps fonts mid-animation. */
const useScriptFontReady = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };
    const fonts = (document as any).fonts;
    if (fonts?.load) {
      fonts.load('400 1em "Great Vibes"').then(finish, finish);
    } else {
      finish();
    }
    const t = window.setTimeout(finish, 900);
    return () => window.clearTimeout(t);
  }, []);
  return ready;
};

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fontReady = useScriptFontReady();

  // Close the mobile menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock page scroll + allow Escape while the mobile menu is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 transition-colors duration-200 hover:text-ink after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:bg-ink after:origin-left after:transition-transform after:duration-300 ${
      isActive ? 'text-ink after:scale-x-100' : 'text-neutral-500 after:scale-x-0 hover:after:scale-x-100'
    }`;

  return (
    <>
    <header
      className={`sticky top-0 z-50 transition-[border-color,box-shadow,background-color] duration-300 border-b ${
        isOpen ? 'bg-white' : 'bg-white/90 backdrop-blur-md'
      } ${scrolled || isOpen ? 'border-neutral-200 shadow-[0_8px_24px_-20px_rgba(0,0,0,.6)]' : 'border-transparent'}`}
    >
      <nav className="page flex h-[72px] md:h-20 items-center justify-between" aria-label="Main">
        <Link to="/" aria-label={`${brandText}, home`} className="font-script text-[2rem] md:text-[2.2rem] leading-none text-ink">
          <span aria-hidden="true" className={`brand-write ${fontReady ? '' : '[animation-play-state:paused]'}`}>
            {brandText}
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-9 text-[11px] font-semibold uppercase tracking-[0.2em]">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={linkClass}>
              {link.name}
            </NavLink>
          ))}
          <Link to="/recover" className="btn-dark !px-5 !py-2.5 !text-[10px]">
            My Books
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden relative -mr-2 h-11 w-11 grid place-items-center"
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span className={`absolute left-0 top-0 h-px w-6 bg-ink transition-transform duration-300 ease-smooth ${isOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
            <span className={`absolute left-0 bottom-0 h-px w-6 bg-ink transition-transform duration-300 ease-smooth ${isOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
          </span>
        </button>
      </nav>
    </header>

      {/* Mobile menu — rendered outside the header: the header's backdrop blur would otherwise
          confine this fixed panel to the header's own height, leaving the page showing through. */}
      <div
        id="mobile-menu"
        aria-hidden={!isOpen}
        className={`md:hidden fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto bg-white transition-[opacity,visibility] duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="page flex h-full flex-col justify-between py-10">
          <ul className="space-y-1">
            {[{ name: 'Home', path: '/' }, ...navLinks].map((link, i) => (
              <li
                key={link.path}
                className={`transition-all duration-500 ease-smooth ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                style={{ transitionDelay: isOpen ? `${60 + i * 40}ms` : '0ms' }}
              >
                <NavLink
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `block border-b border-neutral-100 py-4 font-serif text-[2rem] leading-tight ${isActive ? 'italic text-ink' : 'text-neutral-700 hover:text-ink'}`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            <Link to="/recover" className="btn-dark w-full">Access my books</Link>
            <Link to="/admin" className="block text-center text-[10px] uppercase tracking-[0.25em] text-neutral-500 py-2">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
