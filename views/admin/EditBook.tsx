import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Book, BookStatus } from '../../types';
import { storage } from '../../services/storage';

export const EditBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const books = storage.getBooks();
    const found = books.find((b) => b.id === id);
    if (found) {
      setBook(found);
      return;
    }
    setBook(null);
  }, [id]);

  const title = useMemo(() => (book ? `Edit: ${book.title}` : 'Edit Book'), [book]);

  const encodeImageFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => {
        const src = reader.result;
        if (typeof src !== 'string') {
          reject(new Error('Invalid file data'));
          return;
        }

        img.onload = () => {
          const maxW = 800;
          const maxH = 1200;
          let { width, height } = img;

          const scale = Math.min(maxW / width, maxH / height, 1);
          const targetW = Math.max(1, Math.round(width * scale));
          const targetH = Math.max(1, Math.round(height * scale));

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(src);
            return;
          }

          ctx.drawImage(img, 0, 0, targetW, targetH);
          const encoded = canvas.toDataURL('image/jpeg', 0.85);
          resolve(encoded);
        };

        img.onerror = () => resolve(src);
        img.src = src;
      };

      reader.readAsDataURL(file);
    });

  const handleCoverUpload: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !book) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const encoded = await encodeImageFile(file);
    const updatedBook = { ...book, coverImage: encoded };
    setBook(updatedBook);

    const books = storage.getBooks();
    const updated = books.map((b) => (b.id === updatedBook.id ? updatedBook : b));
    storage.saveBooks(updated);
  };

  const handleSave = () => {
    if (!book) return;

    setIsSaving(true);
    try {
      const books = storage.getBooks();
      const updated = books.map((b) => {
        if (b.id !== book.id) return b;
        return { ...book };
      });

      storage.saveBooks(updated);
      navigate('/admin/books');
    } finally {
      setIsSaving(false);
    }
  };

  if (!book) {
    return (
      <div className="bg-white border border-black p-8">
        <h1 className="text-2xl font-serif font-bold mb-2">Book not found</h1>
        <p className="text-sm text-gray-500 mb-8">This book may have been removed from the archive.</p>
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
                Uploads are stored in your browser for this device (no server upload).
              </p>
            </div>
          </div>

          <div className="border border-black p-4 bg-white">
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-3">Preview</p>
            <div className="flex justify-center">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full max-w-xs object-cover shadow-2xl border-4 border-white"
              />
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
