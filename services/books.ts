import { Book } from '../types';
import { supabase } from './supabaseClient';

export type BookRow = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  price_kes: number;
  status: string;
  cover_path: string | null;
  cover_url: string | null;
  pdf_path?: string | null;
  pdf_updated_at?: string | null;
  published_date: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

const toBook = (row: BookRow): Book => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  synopsis: row.synopsis,
  price: row.price_kes,
  status: row.status as any,
  coverImage: row.cover_url ?? '',
  pdfPath: row.pdf_path ?? null,
  pdfUpdatedAt: row.pdf_updated_at ?? null,
  publishedDate: row.published_date ?? '',
  isFeatured: row.is_featured
});

// Short-lived in-memory cache so moving between pages (Home → Books → a book) doesn't refetch the catalogue.
const LIST_TTL_MS = 60_000;
let listCache: { at: number; promise: Promise<Book[]> } | null = null;

export const invalidateBooksCache = () => {
  listCache = null;
};

// Downscale large cover images in the browser before upload, so visitors never download multi-megabyte covers.
const MAX_COVER_WIDTH = 1000;
const compressCover = async (file: File): Promise<File> => {
  if (file.size < 350 * 1024 || typeof createImageBitmap !== 'function') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_COVER_WIDTH / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
    if (!blob || blob.size >= file.size) return file;
    const base = file.name.replace(/\.[^.]+$/, '') || 'cover';
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
};

export const booksApi = {
  list: async (): Promise<Book[]> => {
    if (listCache && Date.now() - listCache.at < LIST_TTL_MS) return listCache.promise;

    const promise = (async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as BookRow[]).map(toBook);
    })();

    listCache = { at: Date.now(), promise };
    promise.catch(() => {
      listCache = null;
    });
    return promise;
  },

  /** Returns a book from the cached catalogue instantly, if it has already been loaded. */
  peekBySlug: (slug: string): Promise<Book | null> | null => {
    if (!listCache || Date.now() - listCache.at >= LIST_TTL_MS) return null;
    return listCache.promise.then((books) => books.find((b) => b.slug === slug) ?? null).catch(() => null);
  },

  getBySlug: async (slug: string): Promise<Book | null> => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return toBook(data as BookRow);
  },

  getById: async (id: string): Promise<Book | null> => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return toBook(data as BookRow);
  },

  update: async (id: string, patch: Partial<BookRow>): Promise<Book> => {
    invalidateBooksCache();
    const { data, error } = await supabase
      .from('books')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toBook(data as BookRow);
  },

  remove: async (id: string): Promise<void> => {
    invalidateBooksCache();
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
  },

  uploadCover: async (bookId: string, originalFile: File): Promise<{ cover_path: string; cover_url: string } > => {
    invalidateBooksCache();
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(originalFile.type)) {
      throw new Error('Unsupported file type. Please upload a JPG, PNG, or WebP image.');
    }
    const file = await compressCover(originalFile);

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error('File too large. Max size is 5MB.');
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    void safeExt;

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) throw new Error('You must be logged in to upload a cover image.');

    const formData = new FormData();
    formData.append('bookId', bookId);
    formData.append('cover', file);

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-book-cover`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: formData,
    });

    const raw = await res.text();
    let body: any = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      body = null;
    }

    if (!res.ok) {
      const msg = body?.error || raw || `Cover upload failed (status ${res.status})`;
      throw new Error(msg);
    }

    if (!body?.cover_path || !body?.cover_url) {
      throw new Error('Cover upload succeeded but response was missing cover_url/cover_path');
    }

    return { cover_path: body.cover_path, cover_url: body.cover_url };
  }
  ,

  uploadPdf: async (bookId: string, file: File): Promise<{ pdf_path: string } > => {
    if (file.type !== 'application/pdf') {
      throw new Error('Unsupported file type. Please upload a PDF.');
    }

    const maxBytes = 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error('File too large. Max size is 50MB.');
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) throw new Error('You must be logged in to upload a PDF.');

    const formData = new FormData();
    formData.append('bookId', bookId);
    formData.append('pdf', file);

    let res: Response;
    try {
      res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-book-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: formData,
      });
    } catch (e: any) {
      throw new Error('Could not reach upload-book-pdf function. Deploy the function in Supabase and check CORS/network settings.');
    }

    const raw = await res.text();
    let body: any = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      body = null;
    }

    if (!res.ok) {
      const msg = body?.error || raw || `PDF upload failed (status ${res.status})`;
      throw new Error(msg);
    }

    if (!body?.pdf_path) {
      throw new Error('PDF upload succeeded but response was missing pdf_path');
    }

    return { pdf_path: body.pdf_path };
  }
};
