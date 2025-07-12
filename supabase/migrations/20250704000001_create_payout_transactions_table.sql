-- Create payout_transactions table for tracking seller payouts
CREATE TABLE payout_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  transfer_code TEXT,
  paystack_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reversed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  -- Indexes for performance
  CONSTRAINT unique_order_payout UNIQUE(order_id)
);

-- Add indexes
CREATE INDEX idx_payout_transactions_seller_id ON payout_transactions(seller_id);
CREATE INDEX idx_payout_transactions_status ON payout_transactions(status);
CREATE INDEX idx_payout_transactions_created_at ON payout_transactions(created_at DESC);

-- Add RLS policies
ALTER TABLE payout_transactions ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own payout transactions
CREATE POLICY "Sellers can view own payouts" ON payout_transactions
  FOR SELECT USING (auth.uid() = seller_id);

-- Only admin can insert/update payout transactions
CREATE POLICY "Admin can manage payouts" ON payout_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_payout_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payout_transactions_updated_at
  BEFORE UPDATE ON payout_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_transactions_updated_at();

-- Add payout and refund tracking columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payout_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payout_failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payout_retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_reference TEXT;

-- Create function to automatically process payouts when order is collected
CREATE OR REPLACE FUNCTION trigger_payout_on_collection()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed to 'collected' and payment is still held
  IF NEW.status = 'collected' AND NEW.payment_held = true AND OLD.status != 'collected' THEN
    -- Insert payout transaction record
    INSERT INTO payout_transactions (
      order_id,
      seller_id,
      amount,
      status
    ) VALUES (
      NEW.id,
      NEW.seller_id,
      NEW.seller_amount,
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER auto_create_payout_on_collection
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_payout_on_collection();

-- Add comments
COMMENT ON TABLE payout_transactions IS 'Tracks seller payout transactions and status';
COMMENT ON COLUMN payout_transactions.transfer_code IS 'Paystack transfer code for tracking';
COMMENT ON COLUMN payout_transactions.retry_count IS 'Number of retry attempts for failed payouts';
