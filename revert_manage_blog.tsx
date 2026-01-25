import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export const ManageBlog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('publishedDate', { ascending: false });
      
      if (error) throw error;
      setBlogPosts(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
          Error: {error}
        </div>
        <button
          onClick={fetchBlogPosts}
          className="bg-black text-white px-4 py-2 text-sm uppercase tracking-widest font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-serif font-bold mb-6">Manage Blog Posts</h2>
      
      {blogPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No blog posts found.
        </div>
      ) : (
        <div className="space-y-4">
          {blogPosts.map(post => (
            <div key={post.id} className="bg-white border border-black p-6">
              <h3 className="text-lg font-serif font-bold">{post.title}</h3>
              <p className="text-gray-600 mb-2">{post.category}</p>
              <p className="text-sm text-gray-500">{post.publishedDate}</p>
              <p className="text-sm text-gray-500">Status: {post.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
