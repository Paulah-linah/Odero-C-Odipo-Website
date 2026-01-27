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
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold mb-6 italic">Get in Touch</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have a story to share or want to collaborate? I'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-12 border border-black shadow-xl">
            <h2 className="text-2xl font-serif font-bold mb-8 italic">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm uppercase tracking-widest font-bold mb-3">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-widest font-bold mb-3">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm uppercase tracking-widest font-bold mb-3">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                  placeholder="What's this about?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm uppercase tracking-widest font-bold mb-3">Message</label>
                <textarea 
                  rows={6}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="Your thoughts, questions, or collaboration ideas..."
                  required
                />
              </div>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 text-green-600 p-4 text-sm font-bold">
                  <div className="mb-2">Email client should have opened. If not, please email directly:</div>
                  <div className="flex items-center justify-center space-x-4">
                    <a
                      href={buildGmailComposeUrl(contactEmail, 'Contact from website', '')}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-black"
                    >
                      {contactEmail}
                    </a>
                    <button 
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
                      className="bg-black text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-800"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-50 text-red-600 p-4 text-sm font-bold">
                  Something went wrong. Please try again or email directly.
                </div>
              )}
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-4 uppercase text-sm font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Opening Email Client...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-16 italic">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email Card */}
            <div className="bg-gray-50 border border-black p-8 text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Email</h3>
              <p className="text-gray-600 mb-2">
                <a
                  href={buildGmailComposeUrl(contactEmail, 'Contact from website', '')}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-black transition-colors"
                >
                  {contactEmail}
                </a>
              </p>
              <p className="text-sm text-gray-500">For general inquiries</p>
            </div>
            
            {/* Phone Card */}
            <div className="bg-gray-50 border border-black p-8 text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Phone</h3>
              <p className="text-gray-600 mb-2">
                <a href={telHref} className="hover:text-black transition-colors">
                  {contactPhone}
                </a>
              </p>
              <p className="text-sm text-gray-500">Mon-Fri 9am-6pm EAT</p>
            </div>
            
            {/* Location Card */}
            <div className="bg-gray-50 border border-black p-8 text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Location</h3>
              <p className="text-gray-600 mb-2">
                {contactLocation}
              </p>
              <p className="text-sm text-gray-500">Available for local and international collaborations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-serif font-bold mb-8 italic">Connect on Social Media</h2>
          <div className="flex justify-center space-x-6">
            {socialLinks.some((x) => x.key === 'facebook') && (
              <a
                href={socialLinks.find((x) => x.key === 'facebook')!.href}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              </a>
            )}

            {socialLinks.some((x) => x.key === 'twitter') && (
              <a
                href={socialLinks.find((x) => x.key === 'twitter')!.href}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              </a>
            )}

            {socialLinks.some((x) => x.key === 'instagram') && (
              <a
                href={socialLinks.find((x) => x.key === 'instagram')!.href}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
              </svg>
              </a>
            )}

            {socialLinks.some((x) => x.key === 'youtube') && (
              <a
                href={socialLinks.find((x) => x.key === 'youtube')!.href}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.016 3.016 0 00.502 6.186 31.247 31.247 0 000 12a31.247 31.247 0 00.502 5.814 3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.016 3.016 0 002.122-2.136A31.247 31.247 0 0024 12a31.247 31.247 0 00-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            )}

            {socialLinks.some((x) => x.key === 'tiktok') && (
              <a
                href={socialLinks.find((x) => x.key === 'tiktok')!.href}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 8.5a6.7 6.7 0 01-3.8-1.2c-.8-.6-1.4-1.3-1.8-2.2v9.7a6.25 6.25 0 11-6.2-6.3c.5 0 1 .1 1.5.2v3.1a3.2 3.2 0 10 2.2 3v-14h3.1c.3 1.2 1 2.2 2 3a6.4 6.4 0 00 2.9 1.2v2.3z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
