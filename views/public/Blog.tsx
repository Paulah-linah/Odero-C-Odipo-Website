import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { LikeButton } from '../../components/LikeButton';
import { NewsletterForm } from '../../components/NewsletterForm';
import { Reveal } from '../../components/Reveal';
import { SmartImg } from '../../components/BookCover';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  read_time: string;
  featured: boolean;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
  image_url?: string;
}

const categories = ['all', 'writing', 'literature', 'social commentary', 'personal reflections'];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

export const Blog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // `silent` refreshes in the background (e.g. when the tab regains focus) without flashing the loading state.
  const fetchBlogPosts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Public fetch error:', err);
      if (!silent) setError(err?.message || 'Unable to load blog posts at this time.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) fetchBlogPosts(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchBlogPosts]);

  const featuredPost = blogPosts.find((post) => post.featured);
  const filteredPosts = (selectedCategory === 'all' ? blogPosts : blogPosts.filter((post) => post.category === selectedCategory)).filter(
    (p) => selectedCategory !== 'all' || p.id !== featuredPost?.id
  );

  return (
    <div className="pb-0 pt-14 md:pt-20">
      <header className="page mb-14">
        <p className="eyebrow mb-5">The notebook</p>
        <h1 className="font-serif text-5xl font-bold md:text-6xl">
          Reflections &amp; <span className="italic font-normal">observations.</span>
        </h1>
      </header>

      {loading ? (
        <div className="page grid grid-cols-1 gap-x-10 gap-y-14 pb-24 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[4/3] w-full" />
              <div className="skeleton mt-5 h-3 w-24" />
              <div className="skeleton mt-4 h-7 w-4/5" />
              <div className="skeleton mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="page pb-24">
          <div className="alert-error flex flex-wrap items-center justify-between gap-4">
            <span>Unable to load blog posts at this time.</span>
            <button type="button" onClick={() => fetchBlogPosts()} className="font-semibold underline underline-offset-4">Try again</button>
          </div>
        </div>
      ) : (
        <>
          {/* Featured */}
          {featuredPost && selectedCategory === 'all' && (
            <section className="page mb-20">
              <Reveal>
                <article className="group grid grid-cols-1 overflow-hidden border border-ink md:grid-cols-2">
                  {featuredPost.image_url && (
                    <Link to={`/blog/${featuredPost.id}`} className="block overflow-hidden bg-mist" tabIndex={-1} aria-hidden="true">
                      <SmartImg
                        src={featuredPost.image_url}
                        sizes="(max-width: 768px) 100vw, 600px"
                        alt=""
                        width={800}
                        height={800}
                        decoding="async"
                        className="h-full w-full object-cover grayscale transition duration-700 ease-smooth group-hover:scale-[1.03] group-hover:grayscale-0 md:aspect-auto aspect-[4/3]"
                      />
                    </Link>
                  )}
                  <div className={`flex flex-col justify-center p-8 md:p-12 ${featuredPost.image_url ? '' : 'md:col-span-2'}`}>
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <span className="bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">Featured</span>
                      <LikeButton blogPostId={featuredPost.id} />
                    </div>
                    <h2 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
                      <Link to={`/blog/${featuredPost.id}`} className="hover:underline hover:underline-offset-4">{featuredPost.title}</Link>
                    </h2>
                    <p className="mt-5 leading-relaxed text-neutral-600">{featuredPost.excerpt}</p>
                    <div className="mt-8 flex items-center justify-between gap-4 text-sm text-neutral-500">
                      <span>{formatDate(featuredPost.date)} {featuredPost.read_time && <>&middot; {featuredPost.read_time}</>}</span>
                      <Link to={`/blog/${featuredPost.id}`} className="link-underline text-ink">Read</Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            </section>
          )}

          {/* Filter */}
          <div className="page mb-12">
            <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="Filter by category">
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                      active ? 'border-ink bg-ink text-white' : 'border-neutral-300 text-neutral-600 hover:border-ink hover:text-ink'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posts */}
          <section className="page pb-24">
            {filteredPosts.length === 0 ? (
              <p className="py-16 text-center font-serif text-2xl italic text-neutral-500">
                {selectedCategory === 'all' && blogPosts.length === 0 ? 'No posts yet — check back soon.' : `No posts in “${selectedCategory}” yet.`}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post, i) => (
                  <Reveal key={post.id} delay={(i % 3) * 70}>
                    <article className="group">
                      {post.image_url && (
                        <Link to={`/blog/${post.id}`} className="mb-6 block aspect-[4/3] overflow-hidden bg-mist" tabIndex={-1} aria-hidden="true">
                          <SmartImg
                            src={post.image_url}
                            maxWidth={800}
                            sizes="(max-width: 768px) 100vw, 400px"
                            alt=""
                            width={800}
                            height={600}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover grayscale transition duration-700 ease-smooth group-hover:scale-[1.03] group-hover:grayscale-0"
                          />
                        </Link>
                      )}
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{post.category}</span>
                        <LikeButton blogPostId={post.id} />
                      </div>
                      <h3 className="font-serif text-2xl font-bold leading-snug">
                        <Link to={`/blog/${post.id}`} className="hover:underline hover:underline-offset-4">{post.title}</Link>
                      </h3>
                      <p className="mt-3 leading-relaxed text-neutral-600 line-clamp-3">{post.excerpt}</p>
                      <p className="mt-5 text-sm text-neutral-500">
                        {formatDate(post.date)} {post.read_time && <>&middot; {post.read_time}</>}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Newsletter */}
      <section className="border-t border-neutral-200 bg-mist py-20">
        <div className="page grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-bold italic md:text-4xl">Stay connected</h2>
            <p className="mt-4 max-w-md text-neutral-600">New posts, writing insights and literary reflections — delivered to your inbox.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
};
