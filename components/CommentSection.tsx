import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Comment } from '../types';

interface CommentSectionProps {
  blogPostId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ blogPostId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });

  useEffect(() => {
    fetchComments();
  }, [blogPostId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('blog_post_id', blogPostId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, show a more helpful message
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('Comments table not found - migration may need to be run');
          setError('Comments feature is not available yet. Please contact administrator.');
          return;
        }
        throw error;
      }
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.author_name.trim() || !formData.content.trim()) {
      setError('Name and comment are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { error } = await supabase
        .from('comments')
        .insert({
          blog_post_id: blogPostId,
          author_name: formData.author_name.trim(),
          author_email: formData.author_email.trim() || 'anonymous@example.com', // Use default if empty
          content: formData.content.trim(),
          status: 'pending'
        });

      if (error) {
        // If table doesn't exist, show a more helpful message
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('Comments table not found - migration may need to be run');
          setError('Comments feature is not available yet. Please contact administrator.');
          return;
        }
        throw error;
      }

      // Reset form
      setFormData({
        author_name: '',
        author_email: '',
        content: ''
      });

      // Show success message
      setError('Your reflection has been submitted for approval.');

    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit reflection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-32"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-serif font-bold mb-8 italic">Reflections ({comments.length})</h3>
      
      {/* Comments List */}
      <div className="space-y-6 mb-12">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">No reflections yet. Be the first to share your resonance!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{comment.author_name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <div className="bg-white p-6 rounded-lg border border-black max-w-md mx-auto">
        <h4 className="text-lg font-serif font-bold mb-4 italic">Leave a Reflection</h4>
        
        {error && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            error.includes('submitted') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="author_name" className="block text-xs font-medium text-gray-700 mb-1">
              YOUR NAME
            </label>
            <input
              type="text"
              id="author_name"
              name="author_name"
              value={formData.author_name}
              onChange={handleInputChange}
              required
              className="w-full border-b border-gray-300 p-2 focus:outline-none focus:border-black transition-colors text-sm"
              placeholder="Anonymous"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-xs font-medium text-gray-700 mb-1">
              COMMENT
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full border-b border-gray-300 p-2 focus:outline-none focus:border-black transition-colors resize-none text-sm"
              placeholder="Share your resonance..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-6 py-2 uppercase text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
          >
            {submitting ? 'POSTING...' : 'POST REFLECTION'}
          </button>
        </form>
      </div>
    </div>
  );
};
