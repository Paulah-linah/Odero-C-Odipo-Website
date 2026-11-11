import React from 'react';

type Props = { className?: string; priority?: boolean };

/** Circular author portrait framed by a fine ring and a slowly turning dashed ring. */
export const AuthorPortrait: React.FC<Props> = ({ className = '', priority = false }) => (
  <div className={`relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-[20rem] ${className}`}>
    <div className="absolute -inset-7 rounded-full border border-dashed border-ink/25 animate-[spin_60s_linear_infinite]" aria-hidden="true" />
    <div className="absolute -inset-3 rounded-full border border-ink/15" aria-hidden="true" />
    <img
      src="/images/author-photo.webp"
      width={720}
      height={772}
      alt="Portrait of Odipo C. Odero"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...({ fetchpriority: priority ? 'high' : 'auto' } as any)}
      className="relative h-full w-full rounded-full bg-mist object-cover object-[50%_28%] shadow-[0_30px_60px_-30px_rgba(0,0,0,.5)]"
    />
  </div>
);
