import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
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
}

export const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const categories = ['all', 'writing', 'literature', 'social commentary', 'personal reflections'];

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  // Also fetch when component gains focus (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBlogPosts();
      }
    };

    const handleFocus = () => {
      fetchBlogPosts();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      console.log('Testing Supabase connection...');
      
      // First test basic connection
      const { data: testData, error: testError } = await supabase
        .from('blog_posts')
        .select('count')
        .limit(1);
      
      console.log('Connection test:', { testData, testError });
      
      if (testError) {
        console.error('Connection failed:', testError);
        throw testError;
      }
      
      console.log('Connection successful, fetching posts...');
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('updated_at', { ascending: false });

      console.log('Blog posts fetched:', { data, error, count: data?.length });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setBlogPosts(data || []);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError(`Failed to load blog posts: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-8 w-64"></div>
            <div className="h-6 bg-gray-200 rounded mb-12 w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white border border-black p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-24"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-serif font-bold mb-6 italic">Blog Archive</h1>
          <div className="bg-red-50 text-red-600 p-8 rounded-lg max-w-md mx-auto">
            <p className="mb-4">Unable to load blog posts at this time.</p>
            <button
              onClick={fetchBlogPosts}
              className="bg-black text-white px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold mb-6 italic">Blog Archive</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Reflections & Observations
          </p>
          <p className="text-sm text-gray-500 mt-2">
            The Notebook
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-8 px-6 md:px-12 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-black p-8 md:p-12">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-black text-white px-3 py-1 text-xs uppercase tracking-widest font-bold">Featured</span>
                <div className="flex items-center gap-3">
                  <LikeButton blogPostId={featuredPost.id} />
                  <span className="text-sm text-gray-500">{featuredPost.read_time}</span>
                </div>
              </div>
              <h2 className="text-3xl font-serif font-bold mb-4 italic">{featuredPost.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{featuredPost.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{new Date(featuredPost.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                <button 
                  onClick={() => navigate(`/blog/${featuredPost.id}`)}
                  className="bg-black text-white px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
                >
                  Read More
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 text-sm uppercase tracking-widest font-bold transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'border border-black hover:bg-black hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {selectedCategory === 'all' 
                  ? 'No published blog posts yet. Check back soon!' 
                  : `No posts found in ${selectedCategory} category.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <article key={post.id} className="bg-white border border-black p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-gray-500">{post.category}</span>
                    <div className="flex items-center gap-3">
                      <LikeButton blogPostId={post.id} />
                      <span className="text-xs text-gray-500">{post.read_time}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-3 italic">{post.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <button 
                      onClick={() => navigate(`/blog/${post.id}`)}
                      className="text-sm font-bold uppercase tracking-widest hover:text-black transition-colors"
                    >
                      Read More →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-serif font-bold mb-8 italic">Stay Connected</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to receive updates on new posts, writing insights, and literary reflections.
          </p>
          <div className="max-w-md mx-auto">
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="your.email@example.com"
                className="flex-1 border-b-2 border-black p-3 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 uppercase text-sm font-bold tracking-widest hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
