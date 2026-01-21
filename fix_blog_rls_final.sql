-- Fixed RLS policies for multiple admin users
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;

-- Create policies for public and admin access
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts" ON blog_posts
  FOR ALL USING (
    auth.role() = 'authenticated'
  );
