-- Migration: Ensure commit system columns exist in orders table
-- Date: 2025-01-17
-- Description: Adds missing commit system columns to support order commits/declines

-- Add commit system columns to orders table if they don't exist
DO $$
BEGIN
    -- Add seller_committed column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'seller_committed'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN seller_committed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added seller_committed column to orders table';
    END IF;

    -- Add committed_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'committed_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN committed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added committed_at column to orders table';
    END IF;

    -- Add declined_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'declined_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN declined_at TIMESTAMPTZ;
        RAISE NOTICE 'Added declined_at column to orders table';
    END IF;

    -- Add decline_reason column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'decline_reason'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN decline_reason TEXT;
        RAISE NOTICE 'Added decline_reason column to orders table';
    END IF;

    -- Add expires_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN expires_at TIMESTAMPTZ;
        RAISE NOTICE 'Added expires_at column to orders table';
    END IF;

    -- Add commit_deadline column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'commit_deadline'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN commit_deadline TIMESTAMPTZ;
        RAISE NOTICE 'Added commit_deadline column to orders table';
    END IF;

    -- Update status enum to include commit-related statuses
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
    ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
        status IN (
            'pending',              -- Payment pending
            'paid',                -- Payment successful, awaiting seller action
            'paid_pending_seller', -- Same as 'paid' but more explicit
            'committed',           -- Seller committed to the sale
            'declined_by_seller',  -- Seller declined the sale
            'courier_assigned',    -- Courier has been assigned
            'collected',           -- Book collected from seller
            'in_transit',          -- Book in transit
            'delivered',           -- Book delivered
            'completed',           -- Order completed
            'cancelled',           -- Order cancelled
            'refunded',            -- Payment refunded
            'expired'              -- Order expired
        )
    );

    RAISE NOTICE 'Updated orders table status constraint to include commit statuses';
END $$;

-- Add index for commit-related queries
CREATE INDEX IF NOT EXISTS idx_orders_seller_committed ON public.orders(seller_committed);
CREATE INDEX IF NOT EXISTS idx_orders_declined_at ON public.orders(declined_at);
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON public.orders(expires_at);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.seller_committed IS 'Whether the seller has committed to fulfilling this order';
COMMENT ON COLUMN public.orders.committed_at IS 'Timestamp when seller committed to the order';
COMMENT ON COLUMN public.orders.declined_at IS 'Timestamp when seller declined the order';
COMMENT ON COLUMN public.orders.decline_reason IS 'Reason provided by seller for declining the order';
COMMENT ON COLUMN public.orders.expires_at IS 'When the order expires if seller does not commit';
COMMENT ON COLUMN public.orders.commit_deadline IS 'Deadline for seller to commit to the order';

SELECT 'Commit system columns ensured for orders table!' as status;
