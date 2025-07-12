-- Add missing commit system columns to orders table
-- Run this script in your Supabase SQL editor

-- Add declined_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'declined_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN declined_at TIMESTAMPTZ;
        RAISE NOTICE 'Added declined_at column to orders table';
    ELSE
        RAISE NOTICE 'declined_at column already exists in orders table';
    END IF;
END $$;

-- Add other commit-related columns if they don't exist
DO $$
BEGIN
    -- seller_committed column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'seller_committed'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN seller_committed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added seller_committed column to orders table';
    END IF;

    -- committed_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'committed_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN committed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added committed_at column to orders table';
    END IF;

    -- decline_reason column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'decline_reason'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN decline_reason TEXT;
        RAISE NOTICE 'Added decline_reason column to orders table';
    END IF;

    -- expires_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN expires_at TIMESTAMPTZ;
        RAISE NOTICE 'Added expires_at column to orders table';
    END IF;
END $$;

-- Update status constraint to include new statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
    status IN (
        'pending',
        'paid',
        'paid_pending_seller',
        'committed',
        'declined_by_seller',
        'courier_assigned',
        'collected',
        'in_transit',
        'delivered',
        'completed',
        'cancelled',
        'refunded',
        'expired'
    )
);

-- Add updated_at column to order_notifications if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'order_notifications'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.order_notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to order_notifications table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in order_notifications table';
    END IF;
END $$;

-- Create trigger for updated_at on order_notifications
DROP TRIGGER IF EXISTS update_order_notifications_updated_at ON public.order_notifications;
CREATE TRIGGER update_order_notifications_updated_at
    BEFORE UPDATE ON public.order_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_seller_committed ON public.orders(seller_committed);
CREATE INDEX IF NOT EXISTS idx_orders_declined_at ON public.orders(declined_at);
CREATE INDEX IF NOT EXISTS idx_order_notifications_updated_at ON public.order_notifications(updated_at);

SELECT 'Commit system columns added successfully!' as result;
