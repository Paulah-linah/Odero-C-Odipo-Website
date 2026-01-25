-- Test simple query to see what's happening
-- First, let's check if we can query without RLS
SET row_security = OFF;
SELECT COUNT(*) as count_without_rls FROM blog_posts;

-- Now with RLS on
SET row_security = ON;
SELECT COUNT(*) as count_with_rls FROM blog_posts;

-- Check current user
SELECT current_user, session_user;

-- Check if user is authenticated
SELECT auth.uid() as user_id, auth.email() as user_email;
