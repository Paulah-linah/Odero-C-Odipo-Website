-- Fix Comments Policies - Simplified Approach

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all comments" ON comments;
DROP POLICY IF EXISTS "Admins can insert comments" ON comments;
DROP POLICY IF EXISTS "Admins can update comments" ON comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON comments;
DROP POLICY IF EXISTS "Approved comments are publicly viewable" ON comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;

-- Simplified policies for testing
CREATE POLICY "Enable read access for all users" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON comments
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON comments
  FOR DELETE USING (true);
