-- Completely remove the slug column since our code doesn't use it
ALTER TABLE blog_posts DROP COLUMN IF EXISTS slug;

-- Verify the column is gone
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
ORDER BY ordinal_position;

-- Test insert without slug
INSERT INTO blog_posts (title, excerpt, content, category, date, read_time) 
VALUES ('Test Post', 'Test excerpt', 'Test content', 'writing', '2024-01-25', '5 min read')
RETURNING id;
