-- Create vipps_payment table for tracking Vipps payments
-- This table stores payment state during the async payment flow

CREATE TABLE IF NOT EXISTS vipps_payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount_ore INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by reference
CREATE INDEX IF NOT EXISTS idx_vipps_payment_reference ON vipps_payment(reference);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_vipps_payment_user_id ON vipps_payment(user_id);

-- Enable RLS
ALTER TABLE vipps_payment ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own payment records
CREATE POLICY "Users can view own payments" ON vipps_payment
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for webhook handlers)
CREATE POLICY "Service role full access" ON vipps_payment
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Update function to modify updated_at on changes
CREATE OR REPLACE FUNCTION update_vipps_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER vipps_payment_updated_at
  BEFORE UPDATE ON vipps_payment
  FOR EACH ROW
  EXECUTE FUNCTION update_vipps_payment_updated_at();
