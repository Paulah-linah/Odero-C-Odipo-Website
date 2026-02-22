CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
