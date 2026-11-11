import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

type SiteSettings = {
  contact_email: string;
  contact_phone: string;
  contact_location: string;
  social_instagram: string;
  social_twitter: string;
  social_facebook: string;
  social_youtube: string;
  social_tiktok: string;
};

const defaultSettings: SiteSettings = {
  contact_email: 'oderocodipo@gmail.com',
  contact_phone: '+254 704 060 687',
  contact_location: 'Nairobi, Kenya',
  social_instagram: '',
  social_twitter: '',
  social_facebook: '',
  social_youtube: '',
  social_tiktok: ''
};

const socialIcons: Record<string, { label: string; d: string }> = {
  facebook: { label: 'Facebook', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  twitter: { label: 'X (Twitter)', d: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
  instagram: { label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z' },
  youtube: { label: 'YouTube', d: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.016 3.016 0 00.502 6.186 31.247 31.247 0 000 12a31.247 31.247 0 00.502 5.814 3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.016 3.016 0 002.122-2.136A31.247 31.247 0 0024 12a31.247 31.247 0 00-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  tiktok: { label: 'TikTok', d: 'M21 8.5a6.7 6.7 0 01-3.8-1.2c-.8-.6-1.4-1.3-1.8-2.2v9.7a6.25 6.25 0 11-6.2-6.3c.5 0 1 .1 1.5.2v3.1a3.2 3.2 0 10 2.2 3v-14h3.1c.3 1.2 1 2.2 2 3a6.4 6.4 0 00 2.9 1.2v2.3z' },
};

export const Contact: React.FC = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSettings);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select(
            'contact_email, contact_phone, contact_location, social_instagram, social_twitter, social_facebook, social_youtube, social_tiktok'
          )
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (!mounted) return;
        setSiteSettings({ ...defaultSettings, ...(data as any) });
      } catch {
        if (!mounted) return;
        setSiteSettings(defaultSettings);
      }
    };

    loadSettings();

    const onSettingsUpdated = () => {
      loadSettings();
    };

    window.addEventListener('odero_settings_updated', onSettingsUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('odero_settings_updated', onSettingsUpdated);
    };
  }, []);

  const socialLinks = useMemo(
    () =>
      [
        { key: 'facebook', href: siteSettings.social_facebook },
        { key: 'twitter', href: siteSettings.social_twitter },
        { key: 'instagram', href: siteSettings.social_instagram },
        { key: 'youtube', href: siteSettings.social_youtube },
        { key: 'tiktok', href: siteSettings.social_tiktok }
      ].filter((x) => Boolean(x.href)),
    [siteSettings]
  );

  const contactEmail = siteSettings.contact_email || defaultSettings.contact_email;
  const contactPhone = siteSettings.contact_phone || defaultSettings.contact_phone;
  const contactLocation = siteSettings.contact_location || defaultSettings.contact_location;
  const telHref = `tel:${contactPhone.replace(/\s+/g, '')}`;

  const buildGmailComposeUrl = (to: string, subject: string, body: string) => {
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to,
      su: subject,
      body
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create mailto link with form data
      const subject = formData.subject;
      const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;

      const gmailUrl = buildGmailComposeUrl(contactEmail, subject, body);
      const mailtoUrl = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Try multiple methods to open email client
      const opened = window.open(gmailUrl, '_blank');
      
      // Fallback if window.open fails
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        // Try creating a link element
        const link = document.createElement('a');
        link.href = gmailUrl;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        window.location.href = mailtoUrl;
      }
      
      setSubmitStatus('success');
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  const mailHref = `mailto:${contactEmail}`;

  return (
    <div className="page pb-28 pt-14 md:pt-20">
      <header className="mb-16 max-w-2xl">
        <p className="eyebrow mb-5">Contact</p>
        <h1 className="font-serif text-5xl font-bold leading-[1.05] md:text-6xl">
          Let&rsquo;s <span className="italic font-normal">talk.</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-neutral-600">
          Have a story to share or want to collaborate? I&rsquo;d love to hear from you.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
        {/* Details */}
        <aside className="lg:col-span-4">
          <dl className="divide-y divide-neutral-200 border-y border-neutral-200">
            <div className="py-6">
              <dt className="field-label">Email</dt>
              <dd className="font-serif text-xl break-all">
                <a href={mailHref} className="hover:underline hover:underline-offset-4">{contactEmail}</a>
              </dd>
              <p className="mt-1 text-sm text-neutral-500">For general inquiries</p>
            </div>
            <div className="py-6">
              <dt className="field-label">Phone</dt>
              <dd className="font-serif text-xl">
                <a href={telHref} className="hover:underline hover:underline-offset-4">{contactPhone}</a>
              </dd>
              <p className="mt-1 text-sm text-neutral-500">Mon&ndash;Fri, 9am&ndash;6pm EAT</p>
            </div>
            <div className="py-6">
              <dt className="field-label">Location</dt>
              <dd className="font-serif text-xl">{contactLocation}</dd>
              <p className="mt-1 text-sm text-neutral-500">Available for local and international collaborations</p>
            </div>
          </dl>

          {socialLinks.length > 0 && (
            <div className="mt-10">
              <p className="field-label mb-4">Follow</p>
              <div className="flex gap-3">
                {socialLinks.map((x) => (
                  <a
                    key={x.key}
                    href={x.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={socialIcons[x.key].label}
                    className="grid h-11 w-11 place-items-center border border-neutral-300 transition-colors hover:border-ink hover:bg-ink hover:text-white"
                  >
                    <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={socialIcons[x.key].d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Form */}
        <div className="lg:col-span-7 lg:col-start-6">
          <form onSubmit={handleSubmit} className="border border-ink p-7 sm:p-10">
            <h2 className="mb-8 font-serif text-2xl font-bold italic">Send a message</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="field-label">Name</label>
                <input id="c-name" type="text" name="name" autoComplete="name" value={formData.name} onChange={handleChange} className="field" placeholder="Your name" required />
              </div>
              <div>
                <label htmlFor="c-email" className="field-label">Email</label>
                <input id="c-email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} className="field" placeholder="you@example.com" required />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="c-subject" className="field-label">Subject</label>
                <input id="c-subject" type="text" name="subject" value={formData.subject} onChange={handleChange} className="field" placeholder="What’s this about?" required />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="c-message" className="field-label">Message</label>
                <textarea id="c-message" rows={6} name="message" value={formData.message} onChange={handleChange} className="field resize-y" placeholder="Your thoughts, questions, or collaboration ideas…" required />
              </div>
            </div>

            <div aria-live="polite">
              {submitStatus === 'success' && (
                <div className="alert-success mt-6">
                  <p className="mb-3">Your email app should have opened with your message. If it didn&rsquo;t, email directly:</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <a href={mailHref} className="font-semibold underline underline-offset-4">{contactEmail}</a>
                    <button
                      type="button"
                      onClick={() => {
                        const subject = formData.subject || 'Contact from website';
                        const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
                        const link = document.createElement('a');
                        link.href = buildGmailComposeUrl(contactEmail, subject, body);
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="btn-dark !px-4 !py-2"
                    >
                      Open Gmail
                    </button>
                  </div>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="alert-error mt-6" role="alert">Something went wrong. Please try again or email directly.</div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-dark mt-8 w-full">
              {isSubmitting ? 'Opening your email…' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
