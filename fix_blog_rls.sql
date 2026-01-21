-- Fix RLS policies for blog posts
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_posts;

-- Create proper policies for public and admin access
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'paulahlinah28@gmail.com'
    )
  );
