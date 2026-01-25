-- Drop existing policies and create simpler ones
DROP POLICY IF EXISTS "Admins can view all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Published posts are publicly viewable" ON blog_posts;

-- Create simple policies
CREATE POLICY "Enable all for blog posts" ON blog_posts
  FOR ALL USING (true) WITH CHECK (true);

-- Temporarily disable RLS for testing
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
