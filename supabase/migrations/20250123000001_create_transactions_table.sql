-- Create transactions table for enhanced payment splitting
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    paystack_reference TEXT NOT NULL UNIQUE,
    book_price INTEGER NOT NULL, -- in kobo (cents)
    delivery_fee INTEGER NOT NULL DEFAULT 0, -- in kobo (cents)
    seller_share INTEGER NOT NULL, -- 90% of book_price
    platform_share INTEGER NOT NULL, -- 10% of book_price
    courier_share INTEGER NOT NULL, -- 100% of delivery_fee
    total_amount INTEGER NOT NULL, -- book_price + delivery_fee
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'delivery_confirmed', 'seller_paid', 'completed', 'failed')),
    delivery_confirmed_at TIMESTAMPTZ,
    seller_paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paystack_ref ON public.transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = seller_id OR 
        auth.uid() = buyer_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update transactions" ON public.transactions
    FOR UPDATE USING (true);

-- Admin can view all transactions
CREATE POLICY "Admin can view all transactions" ON public.transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on transactions table
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to validate transaction splits
CREATE OR REPLACE FUNCTION validate_transaction_split()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate that seller_share + platform_share = book_price
    IF NEW.seller_share + NEW.platform_share != NEW.book_price THEN
        RAISE EXCEPTION 'Invalid transaction split: seller_share + platform_share must equal book_price';
    END IF;
    
    -- Validate that courier_share = delivery_fee
    IF NEW.courier_share != NEW.delivery_fee THEN
        RAISE EXCEPTION 'Invalid transaction split: courier_share must equal delivery_fee';
    END IF;
    
    -- Validate that total_amount = book_price + delivery_fee
    IF NEW.total_amount != NEW.book_price + NEW.delivery_fee THEN
        RAISE EXCEPTION 'Invalid transaction split: total_amount must equal book_price + delivery_fee';
    END IF;
    
    -- Validate that seller gets 90% of book price (allowing for rounding)
    IF ABS(NEW.seller_share - ROUND(NEW.book_price * 0.9)) > 1 THEN
        RAISE EXCEPTION 'Invalid transaction split: seller_share must be approximately 90% of book_price';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to validate transaction splits
DROP TRIGGER IF EXISTS validate_transaction_split_trigger ON public.transactions;
CREATE TRIGGER validate_transaction_split_trigger
    BEFORE INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION validate_transaction_split();

-- Grant necessary permissions
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

-- Comment on table
COMMENT ON TABLE public.transactions IS 'Enhanced transaction records with proper payment splitting: 90% to seller, 10% to platform, 100% of delivery to courier';
