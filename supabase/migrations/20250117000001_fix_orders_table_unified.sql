-- Unified orders table migration to fix Order Not Found issues
-- This migration ensures a consistent orders table schema

-- Drop existing table if it exists to start fresh
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create the unified orders table with proper schema
CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User references
    buyer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    buyer_email text NOT NULL,
    seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Order content
    book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    book_title text NOT NULL,
    book_price integer NOT NULL, -- in kobo (ZAR cents)
    
    -- Payment info
    paystack_ref text UNIQUE NOT NULL, -- Paystack payment reference
    amount integer NOT NULL, -- Total amount in kobo
    delivery_fee integer DEFAULT 0, -- Delivery fee in kobo
    platform_fee integer DEFAULT 0, -- Platform commission in kobo
    seller_amount integer NOT NULL, -- Amount seller receives in kobo
    
    -- Order status
    status text NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',              -- Payment pending
        'paid',                -- Payment successful, awaiting courier
        'courier_assigned',    -- Courier has been assigned the delivery
        'collected',           -- Courier collected book from seller
        'in_transit',          -- Book in transit to buyer
        'delivered',           -- Book delivered to buyer
        'completed',           -- Order completed successfully
        'cancelled',           -- Order cancelled
        'refunded',            -- Payment refunded
        'expired'              -- Collection deadline passed
    )),
    
    -- Delivery info
    courier_provider text, -- 'courier-guy', 'fastway', 'ram', etc.
    courier_service text,  -- Service level selected
    courier_tracking_number text,
    courier_quote_id text,
    
    -- Addresses and delivery details
    shipping_address jsonb NOT NULL,
    pickup_address jsonb,
    delivery_quote jsonb,
    
    -- Important deadlines
    collection_deadline timestamp with time zone,
    delivery_deadline timestamp with time zone,
    
    -- Payment tracking
    payment_held boolean DEFAULT false,
    seller_notified_at timestamp with time zone,
    
    -- Additional data
    seller_subaccount_code text,
    metadata jsonb,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    paid_at timestamp with time zone,
    collected_at timestamp with time zone,
    delivered_at timestamp with time zone,
    completed_at timestamp with time zone
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view orders as buyer" ON public.orders
    FOR SELECT USING (
        buyer_id = auth.uid() OR 
        buyer_email = auth.jwt() ->> 'email'
    );

CREATE POLICY "Users can view orders as seller" ON public.orders
    FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (
        buyer_id = auth.uid() OR 
        buyer_email = auth.jwt() ->> 'email'
    );

CREATE POLICY "Sellers can update their orders" ON public.orders
    FOR UPDATE USING (seller_id = auth.uid())
    WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Buyers can update their orders" ON public.orders
    FOR UPDATE USING (
        buyer_id = auth.uid() OR 
        buyer_email = auth.jwt() ->> 'email'
    )
    WITH CHECK (
        buyer_id = auth.uid() OR 
        buyer_email = auth.jwt() ->> 'email'
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_paystack_ref ON public.orders(paystack_ref);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.orders IS 'Unified orders table for tracking payments and deliveries';
COMMENT ON COLUMN public.orders.amount IS 'Total amount in kobo (ZAR cents)';
COMMENT ON COLUMN public.orders.paystack_ref IS 'Paystack payment reference for tracking';
COMMENT ON COLUMN public.orders.courier_provider IS 'Selected courier company (courier-guy, fastway, etc.)';
COMMENT ON COLUMN public.orders.status IS 'Order status tracking from payment to delivery';

SELECT 'Unified orders table created successfully!' as message;
