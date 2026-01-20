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
  publishedDate: row.published_date ?? '',
  isFeatured: row.is_featured
});

export const booksApi = {
  list: async (): Promise<Book[]> => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as BookRow[]).map(toBook);
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
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
  },

  uploadCover: async (bookId: string, file: File): Promise<{ cover_path: string; cover_url: string } > => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      throw new Error('Unsupported file type. Please upload a JPG, PNG, or WebP image.');
    }

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
};
