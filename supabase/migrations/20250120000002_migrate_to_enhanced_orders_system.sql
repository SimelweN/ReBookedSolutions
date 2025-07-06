-- Migration: Transform current orders to enhanced orders system
-- Date: 2025-01-20
-- Description: Migrates from email-based orders to comprehensive order tracking with notifications and receipts

-- Step 1: Create backup of current orders table
CREATE TABLE IF NOT EXISTS public.orders_backup AS 
SELECT * FROM public.orders;

-- Step 2: Add new columns to existing orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS buyer_id UUID,
ADD COLUMN IF NOT EXISTS book_id UUID,
ADD COLUMN IF NOT EXISTS delivery_option TEXT DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS delivery_address JSONB,
ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
ADD COLUMN IF NOT EXISTS paystack_subaccount TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS commit_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS committed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Step 3: Migrate existing data
-- Update buyer_id from buyer_email by looking up profiles
UPDATE public.orders 
SET buyer_id = profiles.id
FROM public.profiles 
WHERE orders.buyer_email = profiles.email
AND orders.buyer_id IS NULL;

-- Extract book_id from items JSONB (assuming first item has book_id)
UPDATE public.orders 
SET book_id = (items->0->>'book_id')::UUID
WHERE book_id IS NULL 
AND items IS NOT NULL 
AND jsonb_array_length(items) > 0;

-- Migrate paystack_ref to paystack_reference
UPDATE public.orders 
SET paystack_reference = paystack_ref
WHERE paystack_reference IS NULL;

-- Set payment_status based on current status
UPDATE public.orders 
SET payment_status = CASE 
  WHEN status IN ('paid', 'ready_for_payout', 'paid_out') THEN 'paid'
  WHEN status = 'failed' THEN 'unpaid'
  WHEN status = 'cancelled' THEN 'refunded'
  ELSE 'unpaid'
END
WHERE payment_status = 'unpaid';

-- Set delivery_option based on shipping_address
UPDATE public.orders 
SET delivery_option = CASE 
  WHEN shipping_address IS NOT NULL AND shipping_address != '{}' THEN 'delivery'
  ELSE 'pickup'
END;

-- Migrate shipping_address to delivery_address
UPDATE public.orders 
SET delivery_address = shipping_address
WHERE delivery_address IS NULL AND shipping_address IS NOT NULL;

-- Step 4: Update status values to match new schema
UPDATE public.orders 
SET status = CASE 
  WHEN status = 'ready_for_payout' THEN 'committed'
  WHEN status = 'paid_out' THEN 'delivered'
  WHEN status = 'failed' THEN 'cancelled'
  ELSE status
END;

-- Step 5: Add constraints for new columns
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'committed', 'shipped', 'delivered', 'cancelled', 'refunded'));

ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('unpaid', 'paid', 'refunded'));

ALTER TABLE public.orders 
ADD CONSTRAINT orders_delivery_option_check 
CHECK (delivery_option IN ('pickup', 'delivery'));

-- Step 6: Add foreign key constraints
ALTER TABLE public.orders 
ADD CONSTRAINT orders_book_id_fkey 
FOREIGN KEY (book_id) REFERENCES public.books(id);

-- Step 7: Drop old columns (after ensuring data is migrated)
ALTER TABLE public.orders 
DROP COLUMN IF EXISTS buyer_email,
DROP COLUMN IF EXISTS paystack_ref;

-- Step 8: Create receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  receipt_number TEXT NOT NULL UNIQUE,
  buyer_email TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  receipt_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  sent_to_buyer BOOLEAN DEFAULT FALSE,
  sent_to_admin BOOLEAN DEFAULT FALSE
);

-- Step 9: Create order notifications table
CREATE TABLE IF NOT EXISTS public.order_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment_success', 'commit_reminder', 'order_committed', 'order_cancelled', 'receipt_ready', 'order_shipped')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Step 10: Add performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_commit_deadline 
ON public.orders(commit_deadline) 
WHERE status = 'paid';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_payment 
ON public.orders(status, payment_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_buyer_seller 
ON public.orders(buyer_id, seller_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_notifications_user_unread 
ON public.order_notifications(user_id, read) 
WHERE read = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_receipts_order_id 
ON public.receipts(order_id);

-- Step 11: Enable RLS on new tables
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

-- Step 12: Add RLS policies for receipts
CREATE POLICY "Users can view their receipts" ON public.receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = receipts.order_id 
      AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

-- Step 13: Add RLS policies for order notifications
CREATE POLICY "Users can view their own order notifications" ON public.order_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own order notifications" ON public.order_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 14: Create sequence for receipt numbers
CREATE SEQUENCE IF NOT EXISTS receipt_sequence START 1;

-- Step 15: Create function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  receipt_num TEXT;
BEGIN
  receipt_num := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('receipt_sequence')::TEXT, 6, '0');
  RETURN receipt_num;
END;
$$;

-- Step 16: Create function to create order notification
CREATE OR REPLACE FUNCTION create_order_notification(
  p_order_id UUID,
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.order_notifications (order_id, user_id, type, title, message)
  VALUES (p_order_id, p_user_id, p_type, p_title, p_message)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Step 17: Enhanced trigger function for order status changes with notifications
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set 48-hour deadline when order is paid
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    NEW.commit_deadline := NOW() + INTERVAL '48 hours';
    NEW.paid_at := NOW();
    NEW.status := 'paid';
    
    -- Notify both buyer and seller of successful payment
    PERFORM create_order_notification(
      NEW.id, 
      NEW.buyer_id, 
      'payment_success',
      'Payment Successful',
      'Your payment has been processed successfully. The seller has 48 hours to commit to your order.'
    );
    
    PERFORM create_order_notification(
      NEW.id, 
      NEW.seller_id, 
      'payment_success',
      'Payment Received - Action Required',
      'Payment received for your book! Please commit to this order within 48 hours to proceed with the sale.'
    );
  END IF;
  
  -- Handle order commitment
  IF NEW.status = 'committed' AND OLD.status != 'committed' THEN
    NEW.committed_at := NOW();
    
    -- Notify buyer of seller commitment
    PERFORM create_order_notification(
      NEW.id, 
      NEW.buyer_id, 
      'order_committed',
      'Order Confirmed by Seller',
      'Great news! The seller has committed to your order and will prepare it for collection/delivery.'
    );
  END IF;
  
  -- Handle order shipping
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    PERFORM create_order_notification(
      NEW.id, 
      NEW.buyer_id, 
      'order_shipped',
      'Order Shipped',
      'Your order has been shipped and is on its way to you.'
    );
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Step 18: Create the enhanced trigger
DROP TRIGGER IF EXISTS order_commit_deadline_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_status_change_trigger ON public.orders;
CREATE TRIGGER order_status_change_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_status_change();

-- Step 19: Function to auto-cancel expired orders with notifications
CREATE OR REPLACE FUNCTION auto_cancel_expired_orders()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_order RECORD;
BEGIN
  -- Get all expired orders and process them
  FOR expired_order IN 
    SELECT id, buyer_id, seller_id 
    FROM public.orders 
    WHERE 
      payment_status = 'paid' 
      AND status = 'paid'
      AND commit_deadline < NOW()
      AND status NOT IN ('committed', 'cancelled')
  LOOP
    -- Cancel the order
    UPDATE public.orders 
    SET 
      status = 'cancelled',
      cancelled_at = NOW(),
      cancellation_reason = 'Seller failed to commit within 48 hours'
    WHERE id = expired_order.id;
    
    -- Create notifications for both buyer and seller
    INSERT INTO public.order_notifications (order_id, user_id, type, title, message)
    VALUES 
    (
      expired_order.id, 
      expired_order.buyer_id, 
      'order_cancelled',
      'Order Cancelled - Refund Processing',
      'Your order has been automatically cancelled due to seller inactivity. A refund will be processed within 24 hours.'
    ),
    (
      expired_order.id, 
      expired_order.seller_id, 
      'order_cancelled',
      'Order Auto-Cancelled',
      'Your order was automatically cancelled for not committing within 48 hours. This may affect your seller rating.'
    );
  END LOOP;
END;
$$;

-- Step 20: Function to send commit reminders
CREATE OR REPLACE FUNCTION send_commit_reminders()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reminder_order RECORD;
BEGIN
  -- Send reminders 24 hours before deadline
  FOR reminder_order IN 
    SELECT id, seller_id 
    FROM public.orders 
    WHERE 
      status = 'paid'
      AND commit_deadline > NOW()
      AND commit_deadline < NOW() + INTERVAL '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM public.order_notifications 
        WHERE order_id = orders.id 
        AND type = 'commit_reminder' 
        AND sent_at > NOW() - INTERVAL '12 hours'
      )
  LOOP
    PERFORM create_order_notification(
      reminder_order.id,
      reminder_order.seller_id,
      'commit_reminder',
      'Reminder: Order Commitment Required',
      'You have less than 24 hours remaining to commit to this order. Please log in and confirm your commitment.'
    );
  END LOOP;
END;
$$;

-- Step 21: Receipt generation function
CREATE OR REPLACE FUNCTION generate_receipt_for_order(order_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  receipt_id UUID;
  order_data RECORD;
  buyer_profile RECORD;
  seller_profile RECORD;
  receipt_data JSONB;
BEGIN
  -- Get order details
  SELECT * INTO order_data FROM public.orders WHERE id = order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Get buyer and seller profiles
  SELECT * INTO buyer_profile FROM public.profiles WHERE id = order_data.buyer_id;
  SELECT * INTO seller_profile FROM public.profiles WHERE id = order_data.seller_id;
  
  -- Build receipt data
  receipt_data := jsonb_build_object(
    'order_id', order_data.id,
    'receipt_number', generate_receipt_number(),
    'amount', order_data.amount,
    'payment_date', order_data.paid_at,
    'buyer', jsonb_build_object(
      'name', buyer_profile.name,
      'email', buyer_profile.email
    ),
    'seller', jsonb_build_object(
      'name', seller_profile.name,
      'email', seller_profile.email
    ),
    'delivery_option', order_data.delivery_option,
    'delivery_address', order_data.delivery_address
  );
  
  -- Insert receipt
  INSERT INTO public.receipts (
    order_id, 
    receipt_number, 
    buyer_email, 
    seller_email, 
    receipt_data
  )
  VALUES (
    order_id,
    receipt_data->>'receipt_number',
    buyer_profile.email,
    seller_profile.email,
    receipt_data
  )
  RETURNING id INTO receipt_id;
  
  -- Notify buyer that receipt is ready
  PERFORM create_order_notification(
    order_id,
    order_data.buyer_id,
    'receipt_ready',
    'Receipt Available',
    'Your purchase receipt is now available for download.'
  );
  
  RETURN receipt_id;
END;
$$;

-- Step 22: Add updated_at trigger for new tables
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Only create the trigger if the table has an updated_at column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' 
    AND column_name = 'updated_at'
    AND table_schema = 'public'
  ) THEN
    CREATE TRIGGER set_timestamp_receipts
      BEFORE UPDATE ON public.receipts
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END $$;

-- Step 23: Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.receipts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.order_notifications TO authenticated;
GRANT USAGE ON SEQUENCE receipt_sequence TO authenticated;

-- Step 24: Add helpful comments
COMMENT ON TABLE public.orders IS 'Enhanced orders table with comprehensive tracking and 48-hour commitment system';
COMMENT ON COLUMN public.orders.amount IS 'Amount in kobo (ZAR cents)';
COMMENT ON COLUMN public.orders.commit_deadline IS '48-hour deadline for seller to commit after payment';
COMMENT ON TABLE public.receipts IS 'Order receipts with structured data';
COMMENT ON TABLE public.order_notifications IS 'Order-related notifications for buyers and sellers';

-- Step 25: Create notification for migration completion
SELECT 'Enhanced orders system migration completed successfully!' as status,
       'New features: 48h commit system, notifications, receipts, performance indexes' as features,
       'Backup created in orders_backup table' as backup_info;
