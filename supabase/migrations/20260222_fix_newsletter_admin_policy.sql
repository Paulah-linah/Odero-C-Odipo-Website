DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admins can view newsletter subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );


