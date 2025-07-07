-- Create commit system tables and enhance existing ones for 48-hour commit functionality

-- Add commit-related columns to transactions table if not exists
DO $$ 
BEGIN
    -- Add commit deadline column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'commit_deadline') THEN
        ALTER TABLE transactions ADD COLUMN commit_deadline TIMESTAMPTZ;
    END IF;
    
    -- Add expires_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'expires_at') THEN
        ALTER TABLE transactions ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
    
    -- Add seller_committed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'seller_committed') THEN
        ALTER TABLE transactions ADD COLUMN seller_committed BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add committed_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'committed_at') THEN
        ALTER TABLE transactions ADD COLUMN committed_at TIMESTAMPTZ;
    END IF;
    
    -- Add declined_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'declined_at') THEN
        ALTER TABLE transactions ADD COLUMN declined_at TIMESTAMPTZ;
    END IF;
    
    -- Add decline_reason column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'decline_reason') THEN
        ALTER TABLE transactions ADD COLUMN decline_reason TEXT;
    END IF;
    
    -- Add refund_reference column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'refund_reference') THEN
        ALTER TABLE transactions ADD COLUMN refund_reference TEXT;
    END IF;
    
    -- Add refunded_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'refunded_at') THEN
        ALTER TABLE transactions ADD COLUMN refunded_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add commit-related columns to orders table if not exists
DO $$ 
BEGIN
    -- Add commit deadline column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'commit_deadline') THEN
        ALTER TABLE orders ADD COLUMN commit_deadline TIMESTAMPTZ;
    END IF;
    
    -- Add expires_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'expires_at') THEN
        ALTER TABLE orders ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
    
    -- Add seller_committed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'seller_committed') THEN
        ALTER TABLE orders ADD COLUMN seller_committed BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add committed_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'committed_at') THEN
        ALTER TABLE orders ADD COLUMN committed_at TIMESTAMPTZ;
    END IF;
    
    -- Add declined_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'declined_at') THEN
        ALTER TABLE orders ADD COLUMN declined_at TIMESTAMPTZ;
    END IF;
    
    -- Add decline_reason column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'decline_reason') THEN
        ALTER TABLE orders ADD COLUMN decline_reason TEXT;
    END IF;
    
    -- Add refund_reference column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'refund_reference') THEN
        ALTER TABLE orders ADD COLUMN refund_reference TEXT;
    END IF;
    
    -- Add refunded_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'refunded_at') THEN
        ALTER TABLE orders ADD COLUMN refunded_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create order_notifications table if not exists
CREATE TABLE IF NOT EXISTS order_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'sale_committed',
    'commitment_confirmed', 
    'sale_declined',
    'decline_confirmed',
    'commit_expired_refund',
    'commit_expired_penalty',
    'payment_received',
    'order_shipped',
    'order_delivered'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for order_notifications
CREATE INDEX IF NOT EXISTS order_notifications_user_id_idx ON order_notifications(user_id);
CREATE INDEX IF NOT EXISTS order_notifications_order_id_idx ON order_notifications(order_id);
CREATE INDEX IF NOT EXISTS order_notifications_type_idx ON order_notifications(type);
CREATE INDEX IF NOT EXISTS order_notifications_read_idx ON order_notifications(read);
CREATE INDEX IF NOT EXISTS order_notifications_created_at_idx ON order_notifications(created_at);

-- Create indexes for commit system queries on transactions
CREATE INDEX IF NOT EXISTS transactions_seller_commit_status_idx ON transactions(seller_id, status) WHERE status IN ('paid', 'paid_pending_seller');
CREATE INDEX IF NOT EXISTS transactions_commit_deadline_idx ON transactions(commit_deadline) WHERE commit_deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_expires_at_idx ON transactions(expires_at) WHERE expires_at IS NOT NULL;

-- Create indexes for commit system queries on orders  
CREATE INDEX IF NOT EXISTS orders_seller_commit_status_idx ON orders(seller_id, status) WHERE status IN ('paid', 'paid_pending_seller');
CREATE INDEX IF NOT EXISTS orders_commit_deadline_idx ON orders(commit_deadline) WHERE commit_deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_expires_at_idx ON orders(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS on order_notifications
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_notifications
CREATE POLICY "Users can view their own notifications" ON order_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON order_notifications  
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can insert notifications
CREATE POLICY "Service role can insert notifications" ON order_notifications
  FOR INSERT WITH CHECK (true);

-- Create function to automatically set commit deadline on paid orders
CREATE OR REPLACE FUNCTION set_commit_deadline()
RETURNS TRIGGER AS $$
BEGIN
  -- Set commit deadline to 48 hours from now when status changes to paid
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    NEW.commit_deadline = NOW() + INTERVAL '48 hours';
    NEW.expires_at = NOW() + INTERVAL '48 hours';
  END IF;
  
  -- Set committed_at when seller_committed becomes true
  IF NEW.seller_committed = true AND (OLD.seller_committed IS NULL OR OLD.seller_committed = false) THEN
    NEW.committed_at = NOW();
    NEW.status = 'committed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
DROP TRIGGER IF EXISTS set_commit_deadline_trigger ON transactions;
CREATE TRIGGER set_commit_deadline_trigger
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_commit_deadline();

DROP TRIGGER IF EXISTS set_commit_deadline_trigger ON orders;  
CREATE TRIGGER set_commit_deadline_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_commit_deadline();

-- Update existing paid records to have commit deadlines
UPDATE transactions 
SET 
  commit_deadline = created_at + INTERVAL '48 hours',
  expires_at = created_at + INTERVAL '48 hours'
WHERE 
  status IN ('paid', 'paid_pending_seller') 
  AND commit_deadline IS NULL;

UPDATE orders 
SET 
  commit_deadline = created_at + INTERVAL '48 hours',
  expires_at = created_at + INTERVAL '48 hours'
WHERE 
  status IN ('paid', 'paid_pending_seller') 
  AND commit_deadline IS NULL;

-- Create view for pending commits (useful for analytics)
CREATE OR REPLACE VIEW pending_commits AS
SELECT 
  'transaction' as source_table,
  id,
  buyer_id,
  seller_id,
  book_id,
  amount,
  status,
  commit_deadline,
  expires_at,
  seller_committed,
  committed_at,
  declined_at,
  created_at,
  updated_at
FROM transactions 
WHERE status IN ('paid', 'paid_pending_seller') 
  AND seller_committed = false
  AND declined_at IS NULL

UNION ALL

SELECT 
  'order' as source_table,
  id,
  buyer_id,
  seller_id,
  book_id,
  amount,
  status,
  commit_deadline,
  expires_at,
  seller_committed,
  committed_at,
  declined_at,
  created_at,
  updated_at
FROM orders 
WHERE status IN ('paid', 'paid_pending_seller') 
  AND seller_committed = false
  AND declined_at IS NULL;

-- Create function to get commit statistics
CREATE OR REPLACE FUNCTION get_commit_stats(seller_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  total_pending BIGINT,
  urgent_pending BIGINT,
  expired_pending BIGINT,
  total_committed BIGINT,
  total_declined BIGINT,
  commitment_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE status IN ('paid', 'paid_pending_seller') AND seller_committed = false AND declined_at IS NULL) as pending,
      COUNT(*) FILTER (WHERE status IN ('paid', 'paid_pending_seller') AND seller_committed = false AND declined_at IS NULL AND expires_at < NOW() + INTERVAL '2 hours') as urgent,
      COUNT(*) FILTER (WHERE status IN ('paid', 'paid_pending_seller') AND seller_committed = false AND declined_at IS NULL AND expires_at < NOW()) as expired,
      COUNT(*) FILTER (WHERE status = 'committed' OR seller_committed = true) as committed,
      COUNT(*) FILTER (WHERE status = 'declined_by_seller' OR declined_at IS NOT NULL) as declined
    FROM (
      SELECT status, seller_committed, declined_at, expires_at FROM transactions 
      WHERE seller_uuid IS NULL OR seller_id = seller_uuid
      UNION ALL
      SELECT status, seller_committed, declined_at, expires_at FROM orders 
      WHERE seller_uuid IS NULL OR seller_id = seller_uuid
    ) combined
  )
  SELECT 
    pending,
    urgent,
    expired,
    committed,
    declined,
    CASE 
      WHEN (committed + declined) = 0 THEN 0 
      ELSE ROUND(committed::NUMERIC / (committed + declined) * 100, 2)
    END as rate
  FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Create notification trigger function
CREATE OR REPLACE FUNCTION notify_commit_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify on commit status changes
  IF TG_OP = 'UPDATE' THEN
    IF NEW.seller_committed != OLD.seller_committed OR NEW.status != OLD.status THEN
      PERFORM pg_notify(
        'commit_updates',
        json_build_object(
          'table', TG_TABLE_NAME,
          'id', NEW.id,
          'seller_id', NEW.seller_id,
          'status', NEW.status,
          'seller_committed', NEW.seller_committed
        )::text
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notification triggers
DROP TRIGGER IF EXISTS commit_update_notification_trigger ON transactions;
CREATE TRIGGER commit_update_notification_trigger
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_commit_update();

DROP TRIGGER IF EXISTS commit_update_notification_trigger ON orders;
CREATE TRIGGER commit_update_notification_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_commit_update();
