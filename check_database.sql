-- Check the actual database schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
ORDER BY ordinal_position;

-- Check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'blog_posts'
);

-- Check RLS status
SELECT relrowsecurity FROM pg_class WHERE relname = 'blog_posts';
