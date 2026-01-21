-- Simple blog posts table without complex RLS
DROP TABLE IF EXISTS blog_posts CASCADE;

CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'writing',
  date TEXT NOT NULL,
  read_time TEXT NOT NULL DEFAULT '5 min read',
  featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temporarily disable RLS for testing
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- Insert a test post
INSERT INTO blog_posts (title, excerpt, content, category, date, read_time, featured, status) VALUES 
('Test Blog Post', 'This is a test post to verify the blog system works', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'writing', '2026-01-21', '3 min read', true, 'published');

-- Re-enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "Allow all operations for authenticated users" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
