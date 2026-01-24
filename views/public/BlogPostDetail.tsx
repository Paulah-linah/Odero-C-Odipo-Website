import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { CommentSection } from '../../components/CommentSection';
import { LikeButton } from '../../components/LikeButton';

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
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBlogPost(id);
    }
  }, [id]);

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
      <div className="min-h-screen bg-white">
        <div className="py-20 px-6 md:px-12 max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-32"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-8 w-48"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-white">
        <div className="py-20 px-6 md:px-12 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-serif font-bold mb-6 italic">Post Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || 'The blog post you are looking for does not exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="bg-black text-white px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="py-6 px-6 md:px-12 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/blog')}
          className="text-sm font-bold uppercase tracking-widest hover:text-black transition-colors flex items-center gap-2"
        >
          ← Back to Blog
        </button>
      </nav>

      {/* Blog Post Content */}
      <article className="py-8 px-6 md:px-12 max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="bg-black text-white px-3 py-1 text-xs uppercase tracking-widest font-bold">
                {blogPost.category}
              </span>
              <span className="text-sm text-gray-500">{blogPost.read_time}</span>
            </div>
            
            <LikeButton blogPostId={blogPost.id} />
          </div>
          
          {blogPost.image_url && (
            <div className="mb-8 max-w-lg mx-auto">
              <div className="aspect-square w-full overflow-hidden rounded-lg">
                <img 
                  src={blogPost.image_url} 
                  alt={blogPost.title} 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 italic leading-tight">
            {blogPost.title}
          </h1>
          
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <p className="text-gray-600">
              Published on {new Date(blogPost.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {blogPost.featured && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs uppercase tracking-widest font-bold">
                Featured
              </span>
            )}
          </div>
        </header>

        {/* Excerpt */}
        {blogPost.excerpt && (
          <div className="mb-8">
            <p className="text-xl text-gray-600 leading-relaxed italic border-l-4 border-gray-300 pl-6">
              {blogPost.excerpt}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-800 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: blogPost.content.replace(/\n/g, '<br />') }}
          />
        </div>

        {/* Tags/Metadata */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Category:</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-full">
              {blogPost.category}
            </span>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="py-12 px-6 md:px-12 max-w-4xl mx-auto">
        <CommentSection blogPostId={blogPost.id} />
      </section>

      {/* Related Posts Navigation */}
      <section className="py-12 px-6 md:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <button
              onClick={() => navigate('/blog')}
              className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
            >
              Read More Articles
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
