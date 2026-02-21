-- Digital book access tokens (no-login)
CREATE TABLE IF NOT EXISTS public.purchase_access_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  book_id UUID NOT NULL,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  revoked_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_viewed_at TIMESTAMP WITH TIME ZONE NULL,
  view_count INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS purchase_access_tokens_purchase_id_key
ON public.purchase_access_tokens(purchase_id);

ALTER TABLE public.purchase_access_tokens ENABLE ROW LEVEL SECURITY;

-- By default, block direct client access. Edge Functions using service role bypass RLS.

-- Book PDF metadata fields
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS pdf_path TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS pdf_updated_at TIMESTAMP WITH TIME ZONE;
