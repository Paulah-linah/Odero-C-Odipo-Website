import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookStatus } from '../../types';
import { booksApi } from '../../services/books';
import { BookCover } from '../../components/BookCover';
import { Reveal } from '../../components/Reveal';

const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

export const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    setBooks(null);
    booksApi
      .list()
      .then(setBooks)
      .catch((err: any) => {
        setError(err?.message || 'Failed to load books.');
        setBooks([]);
      });
  };

  useEffect(load, []);

  const visible = (books ?? []).filter((b) => b.status !== BookStatus.DRAFT);

  return (
    <div className="page pb-28 pt-14 md:pt-20">
      <header className="mb-16 flex flex-col gap-8 border-b border-neutral-200 pb-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow mb-5">The library</p>
          <h1 className="font-serif text-5xl font-bold md:text-6xl">Books</h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            The complete bibliography of Odipo C. Odero — from published memoirs to experimental anthologies.
          </p>
        </div>
        <Link to="/recover" className="btn-light shrink-0">Already bought? Access your books</Link>
      </header>

      {error && (
        <div className="alert-error mb-10 flex flex-wrap items-center justify-between gap-4">
          <span>{error}</span>
          <button type="button" onClick={load} className="font-semibold underline underline-offset-4">Try again</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-12">
        {books === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[2/3] w-full" />
                <div className="skeleton mt-5 h-6 w-3/4" />
                <div className="skeleton mt-3 h-4 w-1/3" />
              </div>
            ))
          : visible.map((book, i) => {
              const soon = book.status === BookStatus.COMING_SOON;
              return (
                <Reveal key={book.id} delay={(i % 3) * 70}>
                  <Link to={`/books/${book.slug}`} className="group block">
                    <div className="relative">
                      <BookCover
                        src={book.coverImage}
                        title={book.title}
                        priority={i < 3}
                        imgClassName="transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                      />
                      {book.status && book.status !== BookStatus.AVAILABLE && (
                        <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                          {book.status}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-5 font-serif text-xl font-bold leading-snug group-hover:underline group-hover:underline-offset-4 md:text-2xl">
                      {book.title}
                    </h2>
                    <p className="mt-2 text-sm italic leading-relaxed text-neutral-500 line-clamp-3 max-sm:hidden">{book.synopsis}</p>
                    <p className="mt-3 text-sm font-semibold">{soon ? 'Coming soon' : formatKes(book.price)}</p>
                  </Link>
                </Reveal>
              );
            })}
      </div>

      {books !== null && visible.length === 0 && !error && (
        <p className="py-20 text-center font-serif text-2xl italic text-neutral-500">New books are on the way.</p>
      )}
    </div>
  );
};
