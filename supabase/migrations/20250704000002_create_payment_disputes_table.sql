-- Create payment disputes table
CREATE TYPE dispute_type AS ENUM (
  'item_not_received',
  'item_damaged', 
  'item_not_as_described',
  'unauthorized_charge',
  'refund_not_processed',
  'other'
);

CREATE TYPE dispute_status AS ENUM (
  'open',
  'investigating', 
  'resolved',
  'closed'
);

CREATE TYPE dispute_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE resolution_action AS ENUM (
  'refund_buyer',
  'pay_seller',
  'partial_refund',
  'no_action'
);

CREATE TABLE payment_disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dispute_type dispute_type NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  priority dispute_priority NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  resolution_notes TEXT,
  resolution_action resolution_action,
  resolution_amount DECIMAL(10,2),
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_open_dispute_per_order UNIQUE(order_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Add indexes for performance
CREATE INDEX idx_payment_disputes_order_id ON payment_disputes(order_id);
CREATE INDEX idx_payment_disputes_reported_by ON payment_disputes(reported_by);
CREATE INDEX idx_payment_disputes_status ON payment_disputes(status);
CREATE INDEX idx_payment_disputes_priority ON payment_disputes(priority);
CREATE INDEX idx_payment_disputes_created_at ON payment_disputes(created_at DESC);

-- Add columns to orders table for dispute tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS dispute_hold BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS has_dispute BOOLEAN DEFAULT FALSE;

-- Add dispute resolution flag to payout_transactions
ALTER TABLE payout_transactions
ADD COLUMN IF NOT EXISTS dispute_resolution BOOLEAN DEFAULT FALSE;

-- Add RLS policies
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;

-- Users can view disputes they reported
CREATE POLICY "Users can view own disputes" ON payment_disputes
  FOR SELECT USING (auth.uid() = reported_by);

-- Users can create disputes for their orders
CREATE POLICY "Users can create disputes for own orders" ON payment_disputes
  FOR INSERT WITH CHECK (
    auth.uid() = reported_by AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Admin can manage all disputes
CREATE POLICY "Admin can manage all disputes" ON payment_disputes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_payment_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_disputes_updated_at
  BEFORE UPDATE ON payment_disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_disputes_updated_at();

-- Create function to automatically flag orders with disputes
CREATE OR REPLACE FUNCTION flag_order_dispute()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark order as having dispute when dispute is created
  IF TG_OP = 'INSERT' THEN
    UPDATE orders 
    SET has_dispute = TRUE, updated_at = NOW()
    WHERE id = NEW.order_id;
    
    RETURN NEW;
  END IF;
  
  -- Remove dispute flag when all disputes are resolved/closed
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('resolved', 'closed') THEN
    -- Check if there are any other open disputes for this order
    IF NOT EXISTS (
      SELECT 1 FROM payment_disputes 
      WHERE order_id = NEW.order_id 
      AND status IN ('open', 'investigating')
      AND id != NEW.id
    ) THEN
      UPDATE orders 
      SET has_dispute = FALSE, updated_at = NOW()
      WHERE id = NEW.order_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER auto_flag_order_dispute_insert
  AFTER INSERT ON payment_disputes
  FOR EACH ROW
  EXECUTE FUNCTION flag_order_dispute();

CREATE TRIGGER auto_flag_order_dispute_update
  AFTER UPDATE ON payment_disputes
  FOR EACH ROW
  EXECUTE FUNCTION flag_order_dispute();

-- Add comments
COMMENT ON TABLE payment_disputes IS 'Tracks payment disputes and resolution process';
COMMENT ON COLUMN payment_disputes.evidence_urls IS 'Array of URLs to evidence files (images, documents)';
COMMENT ON COLUMN payment_disputes.resolution_action IS 'Action taken to resolve the dispute';
COMMENT ON COLUMN orders.dispute_hold IS 'Whether payment is held due to active dispute';
COMMENT ON COLUMN orders.has_dispute IS 'Whether order has any associated disputes';
