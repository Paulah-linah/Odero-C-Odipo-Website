-- Add buyer_email column to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS buyer_email TEXT NOT NULL DEFAULT '';

-- Update existing rows to have default email
UPDATE purchases 
SET buyer_email = COALESCE(buyer_email, 'guest@example.com')
WHERE buyer_email IS NULL;
