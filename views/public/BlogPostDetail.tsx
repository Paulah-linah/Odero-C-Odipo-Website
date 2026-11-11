import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { CommentSection } from '../../components/CommentSection';
import { LikeButton } from '../../components/LikeButton';
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

export const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBlogPost(id);
    }
  }, [id]);

  useEffect(() => {
    if (blogPost) document.title = `${blogPost.title} | Odipo C. Odero`;
    return () => {
      document.title = 'Odipo C. Odero | Author';
    };
  }, [blogPost]);

  const fetchBlogPost = async (postId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Blog post not found');
        } else {
          throw error;
        }
        return;
      }

      setBlogPost(data);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page max-w-3xl py-20" aria-busy="true">
        <div className="skeleton mb-6 h-3 w-32" />
        <div className="skeleton mb-4 h-12 w-full" />
        <div className="skeleton mb-12 h-12 w-2/3" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="page max-w-3xl py-32 text-center">
        <p className="eyebrow mb-5 justify-center">Not found</p>
        <h1 className="font-serif text-4xl font-bold">This post isn&rsquo;t available</h1>
        <p className="mt-4 text-neutral-600">
          {error || 'The blog post you are looking for does not exist or has been removed.'}
        </p>
        <Link to="/blog" className="btn-dark mt-10">Back to the blog</Link>
      </div>
    );
  }

  const published = new Date(blogPost.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <article className="page max-w-3xl pb-16 pt-10 md:pt-14">
        <nav aria-label="Breadcrumb" className="mb-12 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          <Link to="/blog" className="transition-colors hover:text-ink">← The notebook</Link>
        </nav>

        <header className="mb-12">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            <span className="bg-ink px-3 py-1 text-white">{blogPost.category}</span>
            {blogPost.featured && <span className="border border-ink px-3 py-1 text-ink">Featured</span>}
            {blogPost.read_time && <span>{blogPost.read_time}</span>}
          </div>

          <h1 className="text-balance font-serif text-4xl font-bold leading-[1.1] md:text-6xl">{blogPost.title}</h1>

          <div className="mt-8 flex items-center justify-between gap-4 border-b border-neutral-200 pb-8">
            <p className="text-sm text-neutral-500">
              By Odipo C. Odero &middot; {published}
            </p>
            <LikeButton blogPostId={blogPost.id} />
          </div>
        </header>

        {blogPost.image_url && (
          <figure className="mx-auto mb-12 w-full max-w-sm overflow-hidden bg-mist shadow-[0_20px_40px_-24px_rgba(0,0,0,.45)] sm:max-w-md">
            <SmartImg
              src={blogPost.image_url}
              sizes="(max-width: 640px) 90vw, 448px"
              alt={blogPost.title}
              width={1200}
              height={900}
              decoding="async"
              {...({ fetchpriority: 'high' } as any)}
              className="block max-h-[28rem] w-full object-cover"
            />
          </figure>
        )}

        {blogPost.excerpt && (
          <p className="mb-10 border-l-2 border-ink pl-6 font-serif text-2xl italic leading-relaxed text-neutral-700">
            {blogPost.excerpt}
          </p>
        )}

        <div
          className="space-y-6 font-serif text-[1.2rem] leading-[1.85] text-neutral-800 [&_a]:underline [&_a]:underline-offset-4 [&_p]:mb-6"
          dangerouslySetInnerHTML={{ __html: blogPost.content.replace(/\n/g, '<br />') }}
        />
      </article>

      <section className="page max-w-3xl pb-20">
        <CommentSection blogPostId={blogPost.id} />
      </section>

      <section className="border-t border-neutral-200 bg-mist py-16">
        <div className="page text-center">
          <p className="mb-6 font-serif text-2xl italic">Keep reading</p>
          <Link to="/blog" className="btn-dark">More from the notebook</Link>
        </div>
      </section>
    </div>
  );
};
