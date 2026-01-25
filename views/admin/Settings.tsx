import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

type SiteSettings = {
  site_title: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  contact_location: string;
  social_instagram: string;
  social_twitter: string;
  social_facebook: string;
  social_youtube: string;
  social_tiktok: string;
  maintenance_mode: boolean;
};

const defaultSettings: SiteSettings = {
  site_title: 'Odipo C. Odero',
  tagline: 'Author',
  contact_email: '',
  contact_phone: '',
  contact_location: '',
  social_instagram: '',
  social_twitter: '',
  social_facebook: '',
  social_youtube: '',
  social_tiktok: '',
  maintenance_mode: false
};

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<SiteSettings>(defaultSettings);

  const getErrText = (err: unknown, fallback: string) => {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') {
      const anyErr = err as any;
      const parts = [anyErr.message, anyErr.details, anyErr.hint, anyErr.code].filter(Boolean);
      if (parts.length > 0) return parts.join(' | ');
    }
    if (err instanceof Error) return err.message;
    return fallback;
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError(null);
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) throw error;

        const next = {
          ...defaultSettings,
          ...data
        } as SiteSettings;

        if (!mounted) return;
        setSettings(next);
        setInitialSnapshot(next);
      } catch (err) {
        if (!mounted) return;
        setSettings(defaultSettings);
        setInitialSnapshot(defaultSettings);
        setError(getErrText(err, 'Failed to load settings'));
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(initialSnapshot) !== JSON.stringify(settings);
  }, [settings]);

  const save = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('site_settings')
        .update({ ...settings })
        .eq('id', 1)
        .select('id')
        .maybeSingle();

      if (error) throw error;
      if (!data?.id) {
        throw {
          message: 'Settings update affected 0 rows. This usually means your RLS policy blocked the UPDATE (your user is not admin). Ensure your Supabase user has app_metadata {"role":"admin"} and sign out/in. If the row truly does not exist, create it: INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;'
        };
      }

      setInitialSnapshot(settings);
      setSavedAt(Date.now());
      window.dispatchEvent(new Event('odero_settings_updated'));
    } catch (err) {
      setError(getErrText(err, 'Failed to save settings'));
    }
  };

  const reset = () => {
    setError(null);
    setSettings(defaultSettings);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm uppercase tracking-widest font-bold mb-3">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-serif font-bold">Site Configuration</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm uppercase tracking-widest font-bold border border-black hover:bg-black hover:text-white transition-colors"
            type="button"
          >
            Reset
          </button>
          <button
            onClick={save}
            disabled={!isDirty}
            className="bg-black text-white px-4 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
            type="button"
          >
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {savedAt && (
        <div className="bg-green-50 text-green-700 p-4 rounded mb-6">
          Saved {new Date(savedAt).toLocaleString()}
        </div>
      )}

      <div className="bg-white border border-black p-6 md:p-8 space-y-10">
        <section className="space-y-6">
          <h3 className="text-lg font-serif font-bold">Brand</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Site Title">
              <input
                value={settings.site_title}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                type="text"
              />
            </Field>
            <Field label="Tagline">
              <input
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                type="text"
              />
            </Field>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-serif font-bold">Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Contact Email">
              <input
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                type="email"
              />
            </Field>
            <Field label="Contact Phone">
              <input
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                type="tel"
              />
            </Field>
          </div>
          <Field label="Location">
            <input
              value={settings.contact_location}
              onChange={(e) => setSettings({ ...settings, contact_location: e.target.value })}
              className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
              type="text"
            />
          </Field>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-serif font-bold">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Instagram URL">
              <input
                value={settings.social_instagram}
                onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                type="url"
              />
            </Field>
            <Field label="Twitter/X URL">
              <input
                value={settings.social_twitter}
                onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                type="url"
              />
            </Field>
            <Field label="Facebook URL">
              <input
                value={settings.social_facebook}
                onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                type="url"
              />
            </Field>
            <Field label="YouTube URL">
              <input
                value={settings.social_youtube}
                onChange={(e) => setSettings({ ...settings, social_youtube: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                type="url"
              />
            </Field>
            <Field label="TikTok URL">
              <input
                value={settings.social_tiktok}
                onChange={(e) => setSettings({ ...settings, social_tiktok: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                type="url"
              />
            </Field>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-serif font-bold">Mode</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-bold">Maintenance mode</span>
          </label>
          <p className="text-xs text-gray-500">
            This only stores a flag for now. If you want, I can wire it into the public site to show a maintenance page.
          </p>
        </section>
      </div>
    </div>
  );
};
