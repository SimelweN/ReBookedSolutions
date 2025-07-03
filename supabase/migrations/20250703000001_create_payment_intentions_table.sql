-- Create payment intentions table for tracking payment flow
CREATE TABLE IF NOT EXISTS public.payment_intentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    
    -- Payment amounts in kobo
    amount INTEGER NOT NULL,
    book_price INTEGER NOT NULL,
    delivery_fee INTEGER DEFAULT 0,
    platform_fee INTEGER NOT NULL,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Payment initiated
        'processing',   -- Payment in progress
        'completed',    -- Payment successful and order created
        'failed',       -- Payment failed
        'abandoned',    -- Payment abandoned/timeout
        'cancelled'     -- Payment cancelled
    )),
    
    -- Related records
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    
    -- Additional data
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes') NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.payment_intentions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "payment_intentions_buyer_seller_view" ON public.payment_intentions
    FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "payment_intentions_buyer_insert" ON public.payment_intentions
    FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "payment_intentions_system_update" ON public.payment_intentions
    FOR UPDATE
    USING (true)  -- Allow system updates for payment processing
    WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER handle_payment_intentions_updated_at
    BEFORE UPDATE ON public.payment_intentions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS payment_intentions_reference_idx ON public.payment_intentions(reference);
CREATE INDEX IF NOT EXISTS payment_intentions_buyer_id_idx ON public.payment_intentions(buyer_id);
CREATE INDEX IF NOT EXISTS payment_intentions_seller_id_idx ON public.payment_intentions(seller_id);
CREATE INDEX IF NOT EXISTS payment_intentions_book_id_idx ON public.payment_intentions(book_id);
CREATE INDEX IF NOT EXISTS payment_intentions_status_idx ON public.payment_intentions(status);
CREATE INDEX IF NOT EXISTS payment_intentions_expires_at_idx ON public.payment_intentions(expires_at);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.payment_intentions TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.payment_intentions IS 'Tracks payment intentions and their lifecycle';
COMMENT ON COLUMN public.payment_intentions.reference IS 'Unique payment reference from Paystack';
COMMENT ON COLUMN public.payment_intentions.expires_at IS 'When this payment intention expires (30 minutes default)';

-- Function to clean up expired payment intentions
CREATE OR REPLACE FUNCTION public.cleanup_expired_payment_intentions()
RETURNS void AS $$
BEGIN
    -- Update expired pending payments to abandoned
    UPDATE public.payment_intentions 
    SET status = 'abandoned', updated_at = NOW()
    WHERE status = 'pending' AND expires_at < NOW();
    
    -- Make books available again for abandoned payments
    UPDATE public.books 
    SET sold = false, available = true
    WHERE id IN (
        SELECT book_id 
        FROM public.payment_intentions 
        WHERE status = 'abandoned' 
        AND updated_at > NOW() - INTERVAL '1 hour'  -- Only recently abandoned
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired intentions (would need pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-payments', '*/5 * * * *', 'SELECT public.cleanup_expired_payment_intentions();');

-- Verify table creation
SELECT 'Payment intentions table created successfully!' as status;
