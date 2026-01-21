-- Simple test to verify RLS policies are working
-- This should work for any authenticated user
CREATE POLICY IF NOT EXISTS "Test policy for blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- This should allow public to read published posts
CREATE POLICY IF NOT EXISTS "Public read published posts" ON blog_posts
  FOR SELECT USING (status = 'published');
