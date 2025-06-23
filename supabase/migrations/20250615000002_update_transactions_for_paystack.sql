-- Update transactions table to support Paystack integration and commit system
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid_pending_seller', 'committed', 'completed', 'refunded', 'cancelled')),
ADD COLUMN IF NOT EXISTS seller_committed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS committed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
ADD COLUMN IF NOT EXISTS paystack_subaccount_code TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paystack_reference ON public.transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_transactions_expires_at ON public.transactions(expires_at);

-- Create updated_at trigger for transactions
CREATE TRIGGER handle_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add helpful comments
COMMENT ON COLUMN public.transactions.status IS 'Transaction status in the commit flow';
COMMENT ON COLUMN public.transactions.seller_committed IS 'Whether seller has committed to the sale within 48 hours';
COMMENT ON COLUMN public.transactions.expires_at IS 'When the commit window expires';
COMMENT ON COLUMN public.transactions.paystack_reference IS 'Paystack transaction reference for verification';
COMMENT ON COLUMN public.transactions.paystack_subaccount_code IS 'Paystack subaccount code used for split payment';
