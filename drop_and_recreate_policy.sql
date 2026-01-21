-- Drop the existing policy and create a new one
DROP POLICY "Allow all operations" ON blog_posts;

-- Create the simplest possible policy - allow everything
CREATE POLICY "Allow all operations" ON blog_posts
  FOR ALL USING (true);
