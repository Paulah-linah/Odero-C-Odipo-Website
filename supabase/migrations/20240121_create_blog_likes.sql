-- Blog Likes Table
CREATE TABLE IF NOT EXISTS blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_post_id, user_ip) -- Prevents multiple likes from same IP
);

-- Enable RLS
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view blog likes" ON blog_likes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert blog likes" ON blog_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete their own likes" ON blog_likes
  FOR DELETE USING (true);

-- Indexes for better performance
CREATE INDEX idx_blog_likes_blog_post_id ON blog_likes(blog_post_id);
CREATE INDEX idx_blog_likes_user_ip ON blog_likes(user_ip);

-- Function to get like count for a blog post
CREATE OR REPLACE FUNCTION get_blog_like_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM blog_likes 
    WHERE blog_post_id = post_uuid
  );
END;
$$ LANGUAGE plpgsql;
