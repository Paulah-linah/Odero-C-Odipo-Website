import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookStatus } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { booksApi } from '../../services/books';

export const CreateBook: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [priceKes, setPriceKes] = useState(1200);
  const [status, setStatus] = useState<BookStatus>(BookStatus.AVAILABLE);
  const [publishedDate, setPublishedDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !synopsis || !coverFile) {
      setError('Title, synopsis, and cover image are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError('You must be logged in to create a book.');
        return;
      }

      const slug = slugify(title);

      const { data: inserted, error: insertError } = await supabase
        .from('books')
        .insert({
          title,
          slug,
          synopsis,
          price_kes: priceKes,
          status,
          published_date: publishedDate ? publishedDate : null,
          is_featured: Boolean(isFeatured),
          cover_path: null,
          cover_url: null,
        })
        .select('id')
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      const bookId = inserted.id as string;

      const { cover_path, cover_url } = await booksApi.uploadCover(bookId, coverFile);
      await booksApi.update(bookId, { cover_path, cover_url });

      if (isFeatured) {
        const { error: clearError } = await supabase
          .from('books')
          .update({ is_featured: false })
          .neq('id', bookId);
        if (clearError) {
          setError(clearError.message);
          return;
        }
      }

      navigate('/admin/books');
    } catch (err: any) {
      if (err && typeof err === 'object') {
        const msg = typeof err.message === 'string' ? err.message : 'Something went wrong.';
        const details = typeof err.details === 'string' ? `\n${err.details}` : '';
        const hint = typeof err.hint === 'string' ? `\n${err.hint}` : '';
        const code = typeof err.code === 'string' ? `\ncode: ${err.code}` : '';
        setError(`${msg}${code}${details}${hint}`);
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 border border-black">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-2xl font-serif font-bold">Create New Book</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 text-xs mb-6 font-bold">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Upload + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Cover image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="block w-full text-sm file:border file:border-black file:bg-white file:px-4 file:py-2 file:uppercase file:text-[10px] file:font-bold file:tracking-widest file:text-black"
            />
            <p className="text-[11px] text-gray-500 mt-2">
              JPG, PNG, or WebP. Max 5MB. Will be stored permanently.
            </p>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Preview</label>
            <div className="border border-black p-4 bg-white">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full max-w-xs object-cover shadow-2xl border-4 border-white"
                />
              ) : (
                <div className="w-full max-w-xs h-64 bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-black p-3 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Synopsis</label>
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            className="w-full border border-black p-3 h-32 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookStatus)}
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
              type="number"
              value={priceKes}
              onChange={(e) => setPriceKes(Number(e.target.value))}
              className="w-full border border-black p-3 focus:outline-none"
              min={0}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Published Date (optional)</label>
          <input
            type="date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            className="w-full border border-black p-3 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 border border-black"
          />
          <label htmlFor="featured" className="text-sm font-bold">Featured book</label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/books')}
            className="border border-black px-5 py-2 uppercase text-[10px] font-bold tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-5 py-2 uppercase text-[10px] font-bold tracking-widest hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Book'}
          </button>
        </div>
      </form>
    </div>
  );
};
