import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Book, BookStatus } from '../../types';
import { booksApi } from '../../services/books';

export const EditBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!id) {
        setBook(null);
        return;
      }

      setError('');
      setIsLoading(true);
      try {
        const found = await booksApi.getById(id);
        if (!mounted) return;
        setBook(found);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load book');
        setBook(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const title = useMemo(() => (book ? `Edit: ${book.title}` : 'Edit Book'), [book]);

  const handleCoverUpload: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !book) return;

    setError('');
    try {
      const { cover_path, cover_url } = await booksApi.uploadCover(book.id, file);
      await booksApi.update(book.id, { cover_path, cover_url });

      const refreshed = await booksApi.getById(book.id);
      setBook(refreshed);
    } catch (err: any) {
      if (err && typeof err === 'object') {
        const msg = typeof err.message === 'string' ? err.message : 'Failed to upload cover';
        const details = typeof err.details === 'string' ? `\n${err.details}` : '';
        const hint = typeof err.hint === 'string' ? `\n${err.hint}` : '';
        const code = typeof err.code === 'string' ? `\ncode: ${err.code}` : '';
        setError(`${msg}${code}${details}${hint}`);
      } else {
        setError('Failed to upload cover');
      }
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!book) return;

    setError('');
    setIsSaving(true);
    try {
      await booksApi.update(book.id, {
        title: book.title,
        slug: book.slug,
        synopsis: book.synopsis,
        price_kes: book.price,
        status: book.status,
        published_date: book.publishedDate ? book.publishedDate : null,
        is_featured: Boolean(book.isFeatured)
      });

      navigate('/admin/books');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save book');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-black p-8">
        <h1 className="text-2xl font-serif font-bold mb-2">Loading...</h1>
        <p className="text-sm text-gray-500">Fetching book from the archive.</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white border border-black p-8">
        <h1 className="text-2xl font-serif font-bold mb-2">Book not found</h1>
        <p className="text-sm text-gray-500 mb-8">{error || 'This book may have been removed from the archive.'}</p>
        <button
          onClick={() => navigate('/admin/books')}
          className="bg-black text-white px-6 py-3 uppercase text-xs font-bold tracking-widest"
        >
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black p-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 text-xs mb-6 font-bold">{error}</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold">{title}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/books')}
            className="border border-black px-5 py-2 uppercase text-[10px] font-bold tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-black text-white px-5 py-2 uppercase text-[10px] font-bold tracking-widest hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="mb-6">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Cover image</label>
            <div className="border border-black p-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="block w-full text-sm file:border file:border-black file:bg-white file:px-4 file:py-2 file:uppercase file:text-[10px] file:font-bold file:tracking-widest file:text-black"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-3">
                Uploads are saved to the server and will be visible on the live site.
              </p>
            </div>
          </div>

          <div className="border border-black p-4 bg-white">
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-3">Preview</p>
            <div className="flex justify-center">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full max-w-xs object-cover shadow-2xl border-4 border-white"
                />
              ) : (
                <div className="w-full max-w-xs h-64 bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No cover uploaded yet</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Title</label>
            <input
              value={book.title}
              onChange={(e) => setBook({ ...book, title: e.target.value })}
              className="w-full border border-black p-3 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Synopsis</label>
            <textarea
              value={book.synopsis}
              onChange={(e) => setBook({ ...book, synopsis: e.target.value })}
              className="w-full border border-black p-3 h-36 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Status</label>
              <select
                value={book.status}
                onChange={(e) => setBook({ ...book, status: e.target.value as BookStatus })}
                className="w-full border border-black p-3 bg-white focus:outline-none"
              >
                {Object.values(BookStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Price (KES)</label>
              <input
                value={book.price}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) {
                    setBook({ ...book, price: next });
                  }
                }}
                inputMode="numeric"
                className="w-full border border-black p-3 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
