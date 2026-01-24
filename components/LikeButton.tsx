import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface LikeButtonProps {
  blogPostId: string;
  initialLikes?: number;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ blogPostId, initialLikes = 0 }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userIp, setUserIp] = useState('');

  useEffect(() => {
    getUserIp();
    fetchLikeCount();
    checkIfUserLiked();
  }, [blogPostId]);

  const getUserIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setUserIp(data.ip);
    } catch (error) {
      console.error('Error getting IP:', error);
      // Fallback to a random ID if IP fetch fails
      setUserIp(`user_${Math.random().toString(36).substr(2, 9)}`);
    }
  };

  const fetchLikeCount = async () => {
    try {
      const { count, error } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('blog_post_id', blogPostId);

      if (error) throw error;
      setLikes(count || 0);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const checkIfUserLiked = async () => {
    if (!userIp) return;
    
    try {
      const { data, error } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('blog_post_id', blogPostId)
        .eq('user_ip', userIp)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        return;
      }

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  useEffect(() => {
    if (userIp) {
      checkIfUserLiked();
    }
  }, [userIp, blogPostId]);

  const handleLike = async () => {
    if (!userIp || loading) return;

    setLoading(true);
    
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_post_id', blogPostId)
          .eq('user_ip', userIp);

        if (error) throw error;
        
        setLikes(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        // Like
        const { error } = await supabase
          .from('blog_likes')
          .insert({
            blog_post_id: blogPostId,
            user_ip: userIp
          });

        if (error) throw error;
        
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading || !userIp}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
        isLiked
          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <svg 
        className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      <span className="font-medium text-sm">
        {likes} {likes === 1 ? 'Like' : 'Likes'}
      </span>
    </button>
  );
};
