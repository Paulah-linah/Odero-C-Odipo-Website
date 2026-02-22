import { supabase } from './supabaseClient';

type NewsletterUpdatePayload = {
  type: 'book' | 'blog' | 'event';
  title: string;
  summary?: string;
  linkPath: string;
  dedupeKey: string;
};

export const newsletterApi = {
  notifyUpdate: async (payload: NewsletterUpdatePayload): Promise<void> => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('Admin session required for newsletter notification');
    }

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-newsletter-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();
    let body: any = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      body = null;
    }

    if (!res.ok) {
      throw new Error(body?.error || raw || `Newsletter update failed (${res.status})`);
    }
  },
};
