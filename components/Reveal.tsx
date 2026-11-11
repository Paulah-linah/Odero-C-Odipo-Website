import React, { useEffect, useRef, useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
};

const inViewport = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.94 && r.bottom > 0;
};

/**
 * Fades its content up gently when it scrolls into view.
 * Fail-safe: content already on screen is shown immediately, and a scroll check backs up the
 * IntersectionObserver, so content can never get stuck invisible.
 */
export const Reveal: React.FC<Props> = ({ children, className = '', delay = 0, as = 'div' }) => {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window) || inViewport(el)) {
      setInView(true);
      return;
    }

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setInView(true);
      cleanup();
    };
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && show(),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 }
    );
    const onScroll = () => inViewport(el) && show();
    const cleanup = () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return cleanup;
  }, []);

  const Tag = as as any;
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
};
