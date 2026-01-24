-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all comments" ON comments;
DROP POLICY IF EXISTS "Admins can insert comments" ON comments;
DROP POLICY IF EXISTS "Admins can update comments" ON comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON comments;
DROP POLICY IF EXISTS "Approved comments are publicly viewable" ON comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;

-- Recreate policies with role-based authentication
CREATE POLICY "Admins can view all comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can insert comments" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update comments" ON comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete comments" ON comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Public policy for approved comments
CREATE POLICY "Approved comments are publicly viewable" ON comments
  FOR SELECT USING (status = 'approved');

-- Public policy for inserting comments (they start as pending)
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);
