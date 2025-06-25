-- Migration: Fix orders table schema for Paystack compatibility
-- Date: 2025-01-30
-- Description: Ensures orders table has the correct schema for Paystack payment integration

-- Check if the table exists and what columns it has
DO $$
BEGIN
    -- If the table has buyer_id column (old schema), we need to drop and recreate
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'buyer_id'
        AND table_schema = 'public'
    ) THEN
        -- Drop the old table (this will also drop dependent objects)
        DROP TABLE IF EXISTS public.orders CASCADE;
        
        RAISE NOTICE 'Dropped old orders table with buyer_id schema';
    END IF;
END $$;

-- Create the correct orders table for Paystack integration
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_paystack_ref ON public.orders(paystack_ref);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

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
        auth.uid() IS NOT NULL
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
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.orders IS 'Stores all payment orders with Paystack integration';
COMMENT ON COLUMN public.orders.amount IS 'Amount in kobo (ZAR cents) - multiply by 100 to convert from Rands';

SELECT 'Orders table schema fixed for Paystack compatibility!' as status;
