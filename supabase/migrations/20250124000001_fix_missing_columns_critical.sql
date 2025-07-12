-- Critical fix for missing columns causing HTTP 400 errors
-- This migration ensures expires_at and commit_deadline columns exist

-- Fix orders table
DO $$
BEGIN
    -- Add expires_at column to orders table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN expires_at TIMESTAMPTZ;
        RAISE NOTICE 'Added expires_at column to orders table';
    END IF;

    -- Add commit_deadline column to orders table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'commit_deadline'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN commit_deadline TIMESTAMPTZ;
        RAISE NOTICE 'Added commit_deadline column to orders table';
    END IF;

    -- Add seller_committed column to orders table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'seller_committed'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN seller_committed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added seller_committed column to orders table';
    END IF;

    -- Add declined_at column to orders table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'declined_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN declined_at TIMESTAMPTZ;
        RAISE NOTICE 'Added declined_at column to orders table';
    END IF;

    -- Add decline_reason column to orders table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'decline_reason'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN decline_reason TEXT;
        RAISE NOTICE 'Added decline_reason column to orders table';
    END IF;
END
$$;

-- Fix transactions table if it exists
DO $$
BEGIN
    -- Check if transactions table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
    ) THEN
        -- Add expires_at column to transactions table
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'transactions' 
            AND column_name = 'expires_at'
        ) THEN
            ALTER TABLE public.transactions ADD COLUMN expires_at TIMESTAMPTZ;
            RAISE NOTICE 'Added expires_at column to transactions table';
        END IF;

        -- Add commit_deadline column to transactions table
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'transactions' 
            AND column_name = 'commit_deadline'
        ) THEN
            ALTER TABLE public.transactions ADD COLUMN commit_deadline TIMESTAMPTZ;
            RAISE NOTICE 'Added commit_deadline column to transactions table';
        END IF;

        -- Add seller_committed column to transactions table
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'transactions' 
            AND column_name = 'seller_committed'
        ) THEN
            ALTER TABLE public.transactions ADD COLUMN seller_committed BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added seller_committed column to transactions table';
        END IF;
    END IF;
END
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON public.orders(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_commit_deadline ON public.orders(commit_deadline) WHERE commit_deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_seller_committed ON public.orders(seller_committed) WHERE seller_committed = FALSE;
CREATE INDEX IF NOT EXISTS idx_orders_declined_at ON public.orders(declined_at) WHERE declined_at IS NOT NULL;

-- Create indexes for transactions table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_expires_at ON public.transactions(expires_at) WHERE expires_at IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_transactions_commit_deadline ON public.transactions(commit_deadline) WHERE commit_deadline IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_transactions_seller_committed ON public.transactions(seller_committed) WHERE seller_committed = FALSE;
    END IF;
END
$$;

-- Create or replace function to set commit deadline
CREATE OR REPLACE FUNCTION set_commit_deadline()
RETURNS TRIGGER AS $$
BEGIN
    -- Set commit deadline and expires_at when order becomes paid
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
        NEW.commit_deadline = NOW() + INTERVAL '48 hours';
        NEW.expires_at = NOW() + INTERVAL '48 hours';
        RAISE NOTICE 'Set commit deadline for order %', NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for orders table
DROP TRIGGER IF EXISTS set_commit_deadline_trigger ON public.orders;
CREATE TRIGGER set_commit_deadline_trigger
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION set_commit_deadline();

-- Create trigger for transactions table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
    ) THEN
        DROP TRIGGER IF EXISTS set_commit_deadline_trigger ON public.transactions;
        CREATE TRIGGER set_commit_deadline_trigger
            BEFORE INSERT OR UPDATE ON public.transactions
            FOR EACH ROW
            EXECUTE FUNCTION set_commit_deadline();
    END IF;
END
$$;

-- Update existing paid orders that don't have commit deadlines
UPDATE public.orders 
SET 
    commit_deadline = created_at + INTERVAL '48 hours',
    expires_at = created_at + INTERVAL '48 hours'
WHERE 
    status = 'paid' 
    AND commit_deadline IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.orders.expires_at IS 'When the order expires if seller does not commit';
COMMENT ON COLUMN public.orders.commit_deadline IS 'Deadline for seller to commit to the order (48 hours from payment)';
COMMENT ON COLUMN public.orders.seller_committed IS 'Whether the seller has committed to fulfill the order';
COMMENT ON COLUMN public.orders.declined_at IS 'When the seller declined the order';
COMMENT ON COLUMN public.orders.decline_reason IS 'Reason provided by seller for declining';
