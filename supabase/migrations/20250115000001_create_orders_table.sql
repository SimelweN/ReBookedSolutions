-- Create orders table for comprehensive order management
-- Extends the transactions table for better order tracking

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    
    -- Payment info
    paystack_reference TEXT UNIQUE,
    total_amount INTEGER NOT NULL, -- Total in kobo
    book_price INTEGER NOT NULL, -- Book price in kobo  
    delivery_fee INTEGER DEFAULT 0, -- Delivery fee in kobo
    platform_fee INTEGER DEFAULT 0, -- Platform commission in kobo
    seller_amount INTEGER NOT NULL, -- Amount seller receives in kobo
    
    -- Order status and tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',           -- Payment pending
        'paid',             -- Payment successful, awaiting collection
        'awaiting_collection', -- Courier notified, awaiting pickup
        'collected',        -- Courier collected book
        'in_transit',       -- Book in transit to buyer
        'delivered',        -- Book delivered to buyer
        'completed',        -- Order completed successfully
        'cancelled',        -- Order cancelled
        'refunded',         -- Payment refunded
        'expired'           -- Collection deadline passed
    )),
    
    -- Important deadlines
    collection_deadline TIMESTAMP WITH TIME ZONE,
    delivery_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Shipping and delivery info
    shipping_address JSONB,
    delivery_service TEXT, -- 'ram', 'fastway', 'courier_guy', etc.
    delivery_tracking_number TEXT,
    delivery_quote_info JSONB,
    
    -- Additional data
    seller_subaccount_code TEXT, -- Paystack subaccount for seller
    metadata JSONB,
    cancellation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    collected_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "orders_buyer_seller_view" ON public.orders
    FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "orders_buyer_insert" ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "orders_buyer_seller_update" ON public.orders
    FOR UPDATE
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
    WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create updated_at trigger
CREATE TRIGGER handle_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_seller_id_idx ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS orders_book_id_idx ON public.orders(book_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_paystack_reference_idx ON public.orders(paystack_reference);
CREATE INDEX IF NOT EXISTS orders_collection_deadline_idx ON public.orders(collection_deadline);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.orders IS 'Comprehensive order management with payment tracking';
COMMENT ON COLUMN public.orders.total_amount IS 'Total amount paid by buyer in kobo';
COMMENT ON COLUMN public.orders.book_price IS 'Book price in kobo';
COMMENT ON COLUMN public.orders.delivery_fee IS 'Delivery fee in kobo';
COMMENT ON COLUMN public.orders.platform_fee IS 'Platform commission in kobo';
COMMENT ON COLUMN public.orders.seller_amount IS 'Amount seller receives in kobo';
COMMENT ON COLUMN public.orders.collection_deadline IS 'Deadline for courier collection (48 hours default)';
COMMENT ON COLUMN public.orders.delivery_deadline IS 'Expected delivery date';

-- Verify table creation
SELECT 'Orders table created successfully!' as status;
