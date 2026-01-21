-- Test query to check blog posts data
SELECT 
  id, 
  title, 
  status, 
  featured, 
  updated_at,
  created_at
FROM blog_posts 
ORDER BY updated_at DESC;
