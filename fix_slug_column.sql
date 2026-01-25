-- Make the slug column nullable so we can insert without it
ALTER TABLE blog_posts ALTER COLUMN slug DROP NOT NULL;

-- Or drop the slug column entirely if we don't need it
-- ALTER TABLE blog_posts DROP COLUMN IF EXISTS slug;

-- Test the insert again
INSERT INTO blog_posts (title, excerpt, content, category, date, read_time) 
VALUES ('Test Post', 'Test excerpt', 'Test content', 'writing', '2024-01-25', '5 min read')
RETURNING id;
