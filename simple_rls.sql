-- Reset to simpler, working RLS policies
DROP POLICY IF EXISTS "Public read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;

-- Create very simple policies
CREATE POLICY "Enable all access to blog_posts" ON blog_posts
  FOR ALL USING (true);
