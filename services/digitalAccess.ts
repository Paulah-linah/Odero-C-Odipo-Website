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

  fetchBookPdf: async (token: string): Promise<ArrayBuffer> => {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < 2) {
      attempt += 1;
      try {
        const url = new URL(digitalAccessApi.getReadUrl(token));
        url.searchParams.set('_ts', String(Date.now()));

        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          const raw = await res.text();
          let body: any = null;
          try {
            body = raw ? JSON.parse(raw) : null;
          } catch {
            body = null;
          }
          const msg = body?.error || raw || `Read request failed (status ${res.status})`;

          // Retry once for transient server-side errors.
          if (res.status >= 500 && attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            continue;
          }

          throw new Error(msg);
        }

        return await res.arrayBuffer();
      } catch (e: any) {
        lastError = e instanceof Error ? e : new Error(String(e));
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }
      }
    }

    throw lastError || new Error('Failed to load book');
  },
};

void supabase;
