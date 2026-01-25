-- Check what's wrong with the existing table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'blog_posts';

-- Try a simple query
SELECT COUNT(*) as total_posts FROM blog_posts;

-- Check if we can insert a test record
INSERT INTO blog_posts (title, excerpt, content, category, date, read_time) 
VALUES ('Test Post', 'Test excerpt', 'Test content', 'writing', '2024-01-25', '5 min read')
RETURNING id;
