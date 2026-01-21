import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

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

export const ManageBlog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching blog posts...');
      
      // First test: Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Auth session:', { session, sessionError });
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Second test: Try to access the table
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setBlogPosts(data || []);
      console.log('Blog posts loaded:', data?.length || 0);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBlogPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status: post.status === 'published' ? 'draft' : 'published' })
        .eq('id', post.id);

      if (error) throw error;
      await fetchBlogPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog post status');
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      // Unfeature all other posts if featuring this one
      if (!post.featured) {
        await supabase
          .from('blog_posts')
          .update({ featured: false })
          .neq('id', post.id);
      }

      const { error } = await supabase
        .from('blog_posts')
        .update({ featured: !post.featured })
        .eq('id', post.id);

      if (error) throw error;
      await fetchBlogPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update featured status');
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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif font-bold">Manage Blog Posts</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-black text-white px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
        >
          Create New Post
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white border border-black">
        {blogPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No blog posts found. Create your first post to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {blogPosts.map(post => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-serif font-bold">{post.title}</h3>
                      {post.featured && (
                        <span className="bg-black text-white px-2 py-1 text-xs uppercase tracking-widest font-bold">
                          Featured
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs uppercase tracking-widest font-bold ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.read_time}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setIsEditing(true);
                      }}
                      className="p-2 text-gray-600 hover:text-black transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(post)}
                      className="p-2 text-gray-600 hover:text-black transition-colors"
                      title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {post.status === 'published' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(post)}
                      className="p-2 text-gray-600 hover:text-black transition-colors"
                      title={post.featured ? 'Unfeature' : 'Feature'}
                    >
                      <svg className="w-5 h-5" fill={post.featured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(isEditing || isCreating) && (
        <EditBlogPost
          post={selectedPost}
          isEditing={isEditing}
          isCreating={isCreating}
          onClose={() => {
            setIsEditing(false);
            setIsCreating(false);
            setSelectedPost(null);
          }}
          onSave={() => {
            setIsEditing(false);
            setIsCreating(false);
            setSelectedPost(null);
            fetchBlogPosts();
          }}
        />
      )}
    </div>
  );
};

// EditBlogPost component
const EditBlogPost: React.FC<{
  post: BlogPost | null;
  isEditing: boolean;
  isCreating: boolean;
  onClose: () => void;
  onSave: () => void;
}> = ({ post, isEditing, isCreating, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || 'writing',
    date: post?.date || new Date().toISOString().split('T')[0],
    read_time: post?.read_time || '5 min read',
    featured: post?.featured || false,
    status: post?.status || 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['writing', 'literature', 'social commentary', 'personal reflections'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Saving blog post...', formData);
      
      if (isCreating) {
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        console.log('Blog post created successfully');
      } else if (isEditing && post) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id);

        if (error) throw error;
        console.log('Blog post updated successfully');
      }

      onSave();
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-serif font-bold">
              {isCreating ? 'Create Blog Post' : 'Edit Blog Post'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm uppercase tracking-widest font-bold mb-3">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-widest font-bold mb-3">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-widest font-bold mb-3">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm uppercase tracking-widest font-bold mb-3">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm uppercase tracking-widest font-bold mb-3">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-widest font-bold mb-3">Read Time</label>
                <input
                  type="text"
                  value={formData.read_time}
                  onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                  placeholder="5 min read"
                  className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold">Featured Post</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.status === 'published'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'published' : 'draft' })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold">Published</span>
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-black text-sm uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-6 py-3 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {loading ? 'Saving...' : (isCreating ? 'Create Post' : 'Update Post')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
