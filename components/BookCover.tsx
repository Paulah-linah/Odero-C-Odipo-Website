import React, { useState } from 'react';

type Props = {
  src?: string;
  title: string;
  /** Load immediately with high priority (use for the main, above-the-fold cover). */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /** Rendered width hint for the browser to pick the right image size. */
  sizes?: string;
};

/**
 * Covers are stored as full-size originals (some over 2 MB). We serve resized WebP copies through
 * the wsrv.nl image CDN (free, cached worldwide). If it is ever unavailable we fall back to the original.
 */
const resized = (url: string, width: number) =>
  `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;

const canResize = (url?: string) => !!url && /^https?:\/\//i.test(url);

/** Any remote image (e.g. blog photos) served resized through the same CDN, with fallback to the original. */
export const SmartImg: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { src?: string; maxWidth?: number }> = ({
  src,
  maxWidth = 1200,
  sizes = '100vw',
  onError,
  ...rest
}) => {
  const [useOriginal, setUseOriginal] = useState(!canResize(src));
  if (!src) return null;
  const widths = [400, 800, 1200].filter((w) => w <= maxWidth);
  const props = useOriginal
    ? { src }
    : { src: resized(src, widths[widths.length - 1]), srcSet: widths.map((w) => `${resized(src, w)} ${w}w`).join(', '), sizes };
  return (
    <img
      key={useOriginal ? 'orig' : 'cdn'}
      {...rest}
      {...props}
      onError={(e) => (useOriginal ? onError?.(e) : setUseOriginal(true))}
    />
  );
};

/**
 * A book cover with a fixed 2:3 frame so the layout never jumps, a soft fade-in once loaded,
 * lazy loading by default, and a typographic fallback if the image is missing.
 */
export const BookCover: React.FC<Props> = ({
  src,
  title,
  priority = false,
  className = '',
  imgClassName = '',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [useOriginal, setUseOriginal] = useState(!canResize(src));
  const [failed, setFailed] = useState(!src);

  const imgProps = useOriginal
    ? { src }
    : {
        src: resized(src!, 600),
        srcSet: [300, 450, 600, 900].map((w) => `${resized(src!, w)} ${w}w`).join(', '),
        sizes,
      };

  return (
    <div className={`relative aspect-[2/3] overflow-hidden bg-mist ${className}`}>
      {!loaded && !failed && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center border border-neutral-200 p-6 text-center">
          <span className="font-serif text-xl italic text-neutral-500">{title}</span>
        </div>
      ) : (
        <img
          key={useOriginal ? 'orig' : 'cdn'}
          {...imgProps}
          alt={`Cover of ${title}`}
          width={600}
          height={900}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...({ fetchpriority: priority ? 'high' : 'auto' } as any)}
          onLoad={() => setLoaded(true)}
          onError={() => (useOriginal ? setFailed(true) : setUseOriginal(true))}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
};
