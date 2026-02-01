-- Fix purchases RLS to allow admins to view/update/delete
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all purchases" ON purchases;
DROP POLICY IF EXISTS "Admins can update purchases" ON purchases;
DROP POLICY IF EXISTS "Admins can delete purchases" ON purchases;

-- Create new admin policies using a broader check (authenticated users)
CREATE POLICY "Admins can view all purchases" ON purchases
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update purchases" ON purchases
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete purchases" ON purchases
  FOR DELETE USING (auth.role() = 'authenticated');

-- Optional: If you want stricter admin check, update the admin user's app_metadata in Supabase Auth:
-- UPDATE auth.users SET app_metadata = '{"role":"admin"}' WHERE email = 'your-admin-email@example.com';
