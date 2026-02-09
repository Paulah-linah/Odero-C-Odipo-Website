-- Add Paystack-related purchase fields (safe to run multiple times)
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS buyer_email TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Backfill existing rows
UPDATE purchases
SET buyer_email = COALESCE(buyer_email, ''),
    payment_method = COALESCE(payment_method, '')
WHERE buyer_email IS NULL OR payment_method IS NULL;
