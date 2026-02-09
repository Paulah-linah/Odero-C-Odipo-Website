-- Fix RLS policies for public access to books and blog_posts

-- Books table: Allow public to view all books
DROP POLICY IF EXISTS "Public can view books" ON books;
CREATE POLICY "Public can view books" ON books
  FOR SELECT USING (true);

-- Blog posts table: Ensure public can view published posts
DROP POLICY IF EXISTS "Published posts are publicly viewable" ON blog_posts;
CREATE POLICY "Published posts are publicly viewable" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Also allow public to view site settings
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);
