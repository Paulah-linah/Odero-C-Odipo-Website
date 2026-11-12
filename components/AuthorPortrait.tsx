import React from 'react';

type Props = { className?: string; priority?: boolean };

/**
 * Circular author portrait framed by a fine ring and a slowly turning dashed ring.
 * The rings sit inside the component's own box (not outside it), so it can never push past the
 * screen edge and make the page slide sideways on phones.
 */
export const AuthorPortrait: React.FC<Props> = ({ className = '', priority = false }) => (
  <div className={`relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-[23rem] ${className}`}>
    {/* The spinning ring's square box would poke out at its corners while rotating (widening the
        page on phones), so it turns inside a round clipping frame of the same size. */}
    <div className="absolute inset-0 overflow-hidden rounded-full" aria-hidden="true">
      <div className="absolute inset-0 rounded-full border border-dashed border-ink/25 animate-[spin_60s_linear_infinite]" />
    </div>
    <div className="absolute inset-[16px] rounded-full border border-ink/15" aria-hidden="true" />
    <img
      src="/images/author-photo.webp"
      width={720}
      height={772}
      alt="Portrait of Odipo C. Odero"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...({ fetchpriority: priority ? 'high' : 'auto' } as any)}
      className="absolute inset-[28px] h-[calc(100%-56px)] w-[calc(100%-56px)] rounded-full bg-mist object-cover object-[50%_28%] shadow-[0_30px_60px_-30px_rgba(0,0,0,.5)]"
    />
  </div>
);
