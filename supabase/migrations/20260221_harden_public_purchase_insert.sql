-- Prevent anonymous clients from creating already-paid rows.
-- Public checkout inserts must remain pending until server-side verification or admin update.

DROP POLICY IF EXISTS "Anyone can insert purchases" ON purchases;

CREATE POLICY "Public can insert pending purchases only" ON purchases
  FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND payment_reference IS NOT NULL
    AND buyer_email IS NOT NULL
    AND char_length(trim(buyer_email)) > 0
  );



