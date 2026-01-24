import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Comment } from '../../types';

interface CommentWithPost extends Comment {
  blog_posts: {
    title: string;
  };
}

export const ManageComments: React.FC = () => {
  const [comments, setComments] = useState<CommentWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('comments')
        .select(`
          *,
          blog_posts (
            title
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filter
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'approved' })
        .eq('id', commentId);

      if (error) throw error;
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve comment');
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'rejected' })
        .eq('id', commentId);

      if (error) throw error;
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const getCommentCount = (status: 'pending' | 'approved' | 'rejected') => {
    return comments.filter(comment => comment.status === status).length;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          onClick={fetchComments}
          className="bg-black text-white px-4 py-2 text-sm uppercase tracking-widest font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-serif font-bold">Manage Comments</h2>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', count: comments.length },
            { key: 'pending', label: 'Pending', count: getCommentCount('pending') },
            { key: 'approved', label: 'Approved', count: getCommentCount('approved') },
            { key: 'rejected', label: 'Rejected', count: getCommentCount('rejected') }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                filter === key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white border border-black overflow-x-auto">
        {comments.length === 0 ? (
          <div className="p-8 md:p-12 text-center text-gray-500">
            {filter === 'all' 
              ? 'No comments found yet.' 
              : `No ${filter} comments found.`
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-200 min-w-[800px]">
            {comments.map(comment => (
              <div key={comment.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold">{comment.author_name}</h3>
                        <span className={`px-2 py-1 text-xs uppercase tracking-widest font-bold ${
                          comment.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : comment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {comment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {comment.author_email} • 
                        {' '}{new Date(comment.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {comment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(comment.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors"
                            title="Approve"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleReject(comment.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
                            title="Reject"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {comment.status === 'rejected' && (
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors"
                          title="Approve"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {comment.status === 'approved' && (
                        <button
                          onClick={() => handleReject(comment.id)}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded hover:bg-yellow-700 transition-colors"
                          title="Reject"
                        >
                          ✗ Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded hover:bg-gray-700 transition-colors"
                        title="Delete"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>

                  {/* Blog Post Reference */}
                  <div className="text-sm text-gray-500">
                    On: <span className="font-medium">{comment.blog_posts?.title || 'Unknown Post'}</span>
                  </div>

                  {/* Comment Content */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
