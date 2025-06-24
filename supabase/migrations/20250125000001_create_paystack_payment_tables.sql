-- Migration: Create comprehensive Paystack payment system tables
-- Date: 2025-01-25
-- Description: Creates orders, payout_logs, and updates banking_details table for full payment system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_email text NOT NULL,
    seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount integer NOT NULL CHECK (amount > 0), -- Amount in kobo (ZAR cents)
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'ready_for_payout', 'paid_out', 'failed', 'cancelled')),
    paystack_ref text UNIQUE NOT NULL,
    payment_data jsonb DEFAULT '{}',
    items jsonb NOT NULL DEFAULT '[]', -- Array of order items
    shipping_address jsonb DEFAULT '{}',
    delivery_data jsonb DEFAULT '{}',
    metadata jsonb DEFAULT '{}',
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create payout_logs table
CREATE TABLE IF NOT EXISTS public.payout_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount integer NOT NULL CHECK (amount > 0), -- Amount in kobo (ZAR cents)
    commission integer NOT NULL DEFAULT 0 CHECK (commission >= 0), -- Commission taken in kobo
    transfer_code text,
    recipient_code text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'reversed')),
    reference text,
    paystack_response jsonb DEFAULT '{}',
    error_message text,
    retry_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add new columns to banking_details table if they don't exist
DO $$ 
BEGIN
    -- Add recipient_code column for Paystack transfer recipients
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'banking_details' AND column_name = 'recipient_code') THEN
        ALTER TABLE public.banking_details ADD COLUMN recipient_code text;
    END IF;

    -- Add account_verified column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'banking_details' AND column_name = 'account_verified') THEN
        ALTER TABLE public.banking_details ADD COLUMN account_verified boolean DEFAULT false;
    END IF;

    -- Add subaccount_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'banking_details' AND column_name = 'subaccount_status') THEN
        ALTER TABLE public.banking_details ADD COLUMN subaccount_status text DEFAULT 'pending_setup' 
            CHECK (subaccount_status IN ('pending_setup', 'active', 'inactive'));
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_paystack_ref ON public.orders(paystack_ref);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);

CREATE INDEX IF NOT EXISTS idx_payout_logs_order_id ON public.payout_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payout_logs_seller_id ON public.payout_logs(seller_id);
CREATE INDEX IF NOT EXISTS idx_payout_logs_status ON public.payout_logs(status);
CREATE INDEX IF NOT EXISTS idx_payout_logs_created_at ON public.payout_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_banking_details_recipient_code ON public.banking_details(recipient_code) WHERE recipient_code IS NOT NULL;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payout_logs_updated_at ON public.payout_logs;
CREATE TRIGGER update_payout_logs_updated_at 
    BEFORE UPDATE ON public.payout_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders table
DROP POLICY IF EXISTS "Users can view their own orders as buyer" ON public.orders;
CREATE POLICY "Users can view their own orders as buyer" ON public.orders
    FOR SELECT USING (
        buyer_email = auth.jwt() ->> 'email' OR
        seller_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (
        buyer_email = auth.jwt() ->> 'email'
    );

DROP POLICY IF EXISTS "Sellers can update their orders" ON public.orders;
CREATE POLICY "Sellers can update their orders" ON public.orders
    FOR UPDATE USING (seller_id = auth.uid())
    WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policies for payout_logs table
DROP POLICY IF EXISTS "Sellers can view their own payout logs" ON public.payout_logs;
CREATE POLICY "Sellers can view their own payout logs" ON public.payout_logs
    FOR SELECT USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "System can insert payout logs" ON public.payout_logs;
CREATE POLICY "System can insert payout logs" ON public.payout_logs
    FOR INSERT WITH CHECK (true); -- Allow system/edge functions to insert

DROP POLICY IF EXISTS "System can update payout logs" ON public.payout_logs;
CREATE POLICY "System can update payout logs" ON public.payout_logs
    FOR UPDATE USING (true); -- Allow system/edge functions to update

DROP POLICY IF EXISTS "Admins can manage all payout logs" ON public.payout_logs;
CREATE POLICY "Admins can manage all payout logs" ON public.payout_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Create helpful views for reporting
CREATE OR REPLACE VIEW public.seller_earnings_summary AS
SELECT 
    o.seller_id,
    p.name as seller_name,
    p.email as seller_email,
    COUNT(o.id) as total_orders,
    SUM(CASE WHEN o.status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
    SUM(CASE WHEN o.status = 'ready_for_payout' THEN 1 ELSE 0 END) as ready_orders,
    SUM(CASE WHEN o.status = 'paid_out' THEN 1 ELSE 0 END) as completed_orders,
    SUM(o.amount) as gross_earnings, -- in kobo
    SUM(CASE WHEN o.status IN ('paid', 'ready_for_payout', 'paid_out') 
             THEN ROUND(o.amount * 0.9) ELSE 0 END) as net_earnings, -- 90% after 10% commission
    SUM(CASE WHEN o.status = 'paid_out' 
             THEN ROUND(o.amount * 0.9) ELSE 0 END) as paid_earnings,
    SUM(CASE WHEN o.status IN ('paid', 'ready_for_payout') 
             THEN ROUND(o.amount * 0.9) ELSE 0 END) as pending_earnings
FROM public.orders o
JOIN public.profiles p ON p.id = o.seller_id
WHERE o.status != 'failed' AND o.status != 'cancelled'
GROUP BY o.seller_id, p.name, p.email;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payout_logs TO authenticated;
GRANT SELECT ON public.seller_earnings_summary TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.orders IS 'Stores all payment orders with Paystack integration';
COMMENT ON TABLE public.payout_logs IS 'Tracks seller payouts and transfer status';
COMMENT ON COLUMN public.orders.amount IS 'Amount in kobo (ZAR cents) - multiply by 100 to convert from Rands';
COMMENT ON COLUMN public.payout_logs.amount IS 'Payout amount in kobo (ZAR cents) after commission';
COMMENT ON COLUMN public.payout_logs.commission IS 'Platform commission in kobo (ZAR cents)';
COMMENT ON VIEW public.seller_earnings_summary IS 'Summary view of seller earnings and order statistics';

-- Create function to automatically set order status
CREATE OR REPLACE FUNCTION public.auto_process_ready_orders()
RETURNS void AS $$
BEGIN
    -- This function can be called by cron or edge functions
    -- to automatically process orders that are ready for payout
    UPDATE public.orders 
    SET status = 'paid_out', updated_at = now()
    WHERE status = 'ready_for_payout' 
    AND created_at < now() - INTERVAL '1 hour'; -- 1 hour safety delay
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.auto_process_ready_orders() TO authenticated;

COMMENT ON FUNCTION public.auto_process_ready_orders() IS 'Automatically processes orders ready for payout after safety delay';
