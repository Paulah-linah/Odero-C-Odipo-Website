CREATE TABLE IF NOT EXISTS public.newsletter_dispatch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dedupe_key TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  entity_title TEXT NOT NULL,
  link_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.newsletter_dispatch_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view newsletter dispatch log" ON public.newsletter_dispatch_log;
CREATE POLICY "Admins can view newsletter dispatch log"
  ON public.newsletter_dispatch_log
  FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
    )
  );
