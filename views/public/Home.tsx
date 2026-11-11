import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookStatus } from '../../types';
import { booksApi } from '../../services/books';
import { BookCover } from '../../components/BookCover';
import { Reveal } from '../../components/Reveal';

const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

export const Home: React.FC = () => {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    booksApi
      .list()
      .then((list) => mounted && setBooks(list))
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load books');
        setBooks([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const visible = (books ?? []).filter((b) => b.status !== BookStatus.DRAFT);
  const featured = visible.find((b) => b.isFeatured) || visible.find((b) => b.status === BookStatus.AVAILABLE) || visible[0] || null;
  const comingSoon = visible.filter((b) => b.status === BookStatus.COMING_SOON);
  const library = visible.filter((b) => b.id !== featured?.id && b.status !== BookStatus.COMING_SOON).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="page grid grid-cols-1 items-center gap-14 pb-20 pt-12 md:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-28">
        <div className="lg:col-span-6">
          <p className="eyebrow mb-7">Author &middot; Nairobi</p>
          <h1 className="text-balance font-serif text-[3.25rem] font-bold leading-[1.02] tracking-tight sm:text-7xl lg:text-[5.5rem]">
            Uncoloured <span className="italic font-normal">Stories.</span>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-neutral-600 text-pretty">
            Odipo C. Odero writes uncoloured stories — shaped by memory, love, loss, observation, and the quiet things we feel.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/books" className="btn-dark">Explore books</Link>
            <Link to="/blog" className="btn-light">Read the blog</Link>
          </div>
        </div>

        <div className="flex justify-center lg:col-span-6 lg:justify-end">
          <div className="group relative w-full max-w-[18rem] sm:max-w-[22rem] lg:max-w-[26rem]">
            <div className="absolute -right-4 -top-4 h-full w-full border border-ink/80 transition-transform duration-500 ease-smooth group-hover:-translate-x-2 group-hover:translate-y-2" aria-hidden="true" />
            <img
              src="/images/my-hero.webp"
              width={900}
              height={900}
              alt="A hand-drawn smiling face, the signature image of Odipo C. Odero's work"
              {...({ fetchpriority: 'high' } as any)}
              className="relative w-full bg-mist object-cover grayscale shadow-[0_30px_60px_-30px_rgba(0,0,0,.45)]"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="page pb-10">
          <p className="alert-error">{error}</p>
        </div>
      )}

      {/* Featured book */}
      {books === null ? (
        <section className="border-y border-neutral-200 bg-mist py-24">
          <div className="page grid items-center gap-14 md:grid-cols-12">
            <div className="md:col-span-4"><div className="skeleton mx-auto aspect-[2/3] w-full max-w-xs" /></div>
            <div className="space-y-4 md:col-span-7 md:col-start-6">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-12 w-2/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
            </div>
          </div>
        </section>
      ) : (
        featured && (
          <section className="border-y border-neutral-200 bg-mist py-24 md:py-28">
            <div className="page grid items-center gap-14 md:grid-cols-12">
              <Reveal className="md:col-span-4">
                <Link to={`/books/${featured.slug}`} className="group mx-auto block w-full max-w-xs">
                  <BookCover
                    src={featured.coverImage}
                    title={featured.title}
                    sizes="320px"
                    className="shadow-[0_30px_60px_-25px_rgba(0,0,0,.5)] transition-transform duration-500 ease-smooth group-hover:-translate-y-1"
                  />
                </Link>
              </Reveal>
              <Reveal className="md:col-span-7 md:col-start-6" delay={80}>
                <p className="eyebrow mb-5">Featured work</p>
                <h2 className="font-serif text-5xl font-bold italic leading-tight md:text-6xl">{featured.title}</h2>
                <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-neutral-700 text-pretty">{featured.synopsis}</p>
                <div className="mt-9 flex flex-wrap items-center gap-6">
                  <Link to={`/books/${featured.slug}`} className="btn-dark">
                    {featured.status === BookStatus.COMING_SOON ? 'Learn more' : 'Get the book'}
                  </Link>
                  {featured.status !== BookStatus.COMING_SOON && featured.price > 0 && (
                    <span className="font-serif text-2xl">{formatKes(featured.price)}</span>
                  )}
                </div>
              </Reveal>
            </div>
          </section>
        )
      )}

      {/* More from the library */}
      {library.length > 0 && (
        <section className="page py-24">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-4">The library</p>
              <h2 className="font-serif text-4xl font-bold md:text-5xl">More by Odipo</h2>
            </div>
            <Link to="/books" className="link-underline">View all books</Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 md:gap-x-10">
            {library.map((book, i) => (
              <Reveal key={book.id} delay={i * 70}>
                <Link to={`/books/${book.slug}`} className="group block">
                  <BookCover src={book.coverImage} title={book.title} imgClassName="transition-transform duration-700 ease-smooth group-hover:scale-[1.03]" />
                  <h3 className="mt-5 font-serif text-xl font-bold group-hover:underline group-hover:underline-offset-4 md:text-2xl">{book.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{formatKes(book.price)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Coming soon */}
      {comingSoon.length > 0 && (
        <section className={`py-24 ${library.length > 0 ? 'border-t border-neutral-200' : ''}`}>
          <div className="page">
            <Reveal className="mb-12 text-center">
              <p className="eyebrow mb-4">On the desk</p>
              <h2 className="font-serif text-4xl font-bold md:text-5xl">Coming soon to your bookshelf</h2>
            </Reveal>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-12">
              {comingSoon.map((book, i) => (
                <Reveal key={book.id} delay={i * 70} className="w-40 sm:w-48">
                  <Link to={`/books/${book.slug}`} className="group block text-center">
                    <BookCover src={book.coverImage} title={book.title} imgClassName="grayscale transition duration-500 group-hover:grayscale-0" />
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em]">{book.title}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About the author */}
      <section className="border-t border-neutral-200 py-24 md:py-28">
        <div className="page grid items-center gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <img
              src="/images/author-photo.webp"
              width={720}
              height={772}
              loading="lazy"
              decoding="async"
              alt="Portrait of Odipo C. Odero"
              className="mx-auto w-full max-w-sm bg-mist object-cover grayscale"
            />
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={80}>
            <p className="eyebrow mb-5">The author</p>
            <h2 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
              Observing the world <span className="italic font-normal">from the margins.</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-600 text-pretty">
              A contemporary writer with quiet confidence and emotional depth, Odipo writes about people who are present
              but not fully here — and the conversations we have when no one is watching.
            </p>
            <Link to="/about" className="link-underline mt-9">More about Odipo</Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
};
