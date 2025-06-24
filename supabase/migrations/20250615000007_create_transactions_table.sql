-- Create transactions table for payment tracking
-- This table is essential for the payment system to work

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    transaction_reference TEXT NOT NULL UNIQUE,
    paystack_reference TEXT UNIQUE,
    amount INTEGER NOT NULL, -- Amount in kobo (multiply by 100)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 
        'paid_pending_seller', 
        'committed', 
        'collected', 
        'completed', 
        'cancelled', 
        'refunded'
    )),
    payment_method TEXT DEFAULT 'paystack',
    shipping_info JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY IF NOT EXISTS "Users can view their own transactions" ON public.transactions
    FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own transactions" ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY IF NOT EXISTS "Users can update their own transactions" ON public.transactions
    FOR UPDATE
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
    WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS handle_transactions_updated_at ON public.transactions;
CREATE TRIGGER handle_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.transactions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS transactions_buyer_id_idx ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS transactions_seller_id_idx ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS transactions_book_id_idx ON public.transactions(book_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions(status);
CREATE INDEX IF NOT EXISTS transactions_reference_idx ON public.transactions(transaction_reference);
CREATE INDEX IF NOT EXISTS transactions_paystack_reference_idx ON public.transactions(paystack_reference);

-- Add helpful comments
COMMENT ON TABLE public.transactions IS 'Payment transactions for book purchases';
COMMENT ON COLUMN public.transactions.amount IS 'Amount in kobo (cents)';
COMMENT ON COLUMN public.transactions.status IS 'Transaction status tracking payment flow';
COMMENT ON COLUMN public.transactions.shipping_info IS 'Shipping address and delivery information';
COMMENT ON COLUMN public.transactions.metadata IS 'Additional transaction metadata';

-- Verify table creation
SELECT 'Transactions table created successfully!' as status;
