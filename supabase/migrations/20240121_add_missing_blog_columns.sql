-- Add missing columns to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Update existing posts to have slugs based on titles
UPDATE blog_posts 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'))
WHERE slug IS NULL;

-- Clean up slugs (replace spaces with hyphens, remove multiple hyphens)
UPDATE blog_posts 
SET slug = REGEXP_REPLACE(REGEXP_REPLACE(slug, '\s+', '-', 'g'), '-+', '-', 'g')
WHERE slug IS NOT NULL;
