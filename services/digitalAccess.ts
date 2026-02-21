import { supabase } from './supabaseClient';

export const digitalAccessApi = {
  getAccessToken: async (params: { reference: string; email: string }): Promise<{ token: string }> => {
    let res: Response;
    try {
      res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-access-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          reference: params.reference,
          email: params.email,
        }),
      });
    } catch (_e: any) {
      throw new Error('Could not reach get-access-token function. Deploy the function in Supabase and check CORS/network settings.');
    }

    const raw = await res.text();
    let body: any = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      body = null;
    }

    if (!res.ok) {
      const msg = body?.error || raw || `Access token request failed (status ${res.status})`;
      throw new Error(msg);
    }

    if (!body?.token) {
      throw new Error('Access token response missing token');
    }

    return { token: String(body.token) };
  },

  getReadUrl: (token: string) => {
    const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/read-book`;
    const url = new URL(base);
    url.searchParams.set('token', token);
    return url.toString();
  },
};

void supabase;
