-- Global site settings (single-row table)

CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY,
  site_title text NOT NULL DEFAULT 'Odipo C. Odero',
  tagline text NOT NULL DEFAULT 'Author',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  contact_location text NOT NULL DEFAULT '',
  social_instagram text NOT NULL DEFAULT '',
  social_twitter text NOT NULL DEFAULT '',
  social_facebook text NOT NULL DEFAULT '',
  social_youtube text NOT NULL DEFAULT '',
  social_tiktok text NOT NULL DEFAULT '',
  maintenance_mode boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure single row exists
INSERT INTO public.site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;

-- Anyone (anon/public) can read settings
CREATE POLICY "Site settings are publicly readable" ON public.site_settings
FOR SELECT USING (true);

-- Admins can update/insert settings
CREATE POLICY "Admins can update site settings" ON public.site_settings
FOR UPDATE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can insert site settings" ON public.site_settings
FOR INSERT WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Optional: updated_at auto-update
CREATE OR REPLACE FUNCTION public.update_site_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_site_settings_updated_at();
