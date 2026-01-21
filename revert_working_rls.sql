-- Revert to original working RLS policies
DROP POLICY IF EXISTS "Enable all access to blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Public read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;

-- Original working policies
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');
