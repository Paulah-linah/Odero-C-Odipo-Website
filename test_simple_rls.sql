-- Check if RLS is enabled and test basic access
-- First, make sure RLS is enabled
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Enable all access to blog_posts" ON blog_posts;

-- Create the simplest possible policy for testing
CREATE POLICY "Allow all operations" ON blog_posts
  FOR ALL USING (true);
