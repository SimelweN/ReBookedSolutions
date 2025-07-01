-- Create banking_subaccounts table for Paystack subaccount information
CREATE TABLE IF NOT EXISTS public.banking_subaccounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subaccount_code TEXT NOT NULL,
    subaccount_id TEXT NOT NULL,
    subaccount_status TEXT DEFAULT 'active' CHECK (subaccount_status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id),
    UNIQUE(subaccount_code)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.banking_subaccounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for banking_subaccounts
-- Users can only see and modify their own subaccount details
CREATE POLICY "Users can view their own subaccount" ON public.banking_subaccounts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subaccount" ON public.banking_subaccounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subaccount" ON public.banking_subaccounts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subaccount" ON public.banking_subaccounts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER handle_banking_subaccounts_updated_at
    BEFORE UPDATE ON public.banking_subaccounts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_subaccounts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.banking_subaccounts IS 'Stores Paystack subaccount information for users';
COMMENT ON COLUMN public.banking_subaccounts.subaccount_code IS 'Paystack subaccount code for payment routing';
COMMENT ON COLUMN public.banking_subaccounts.subaccount_id IS 'Paystack subaccount ID';
COMMENT ON COLUMN public.banking_subaccounts.user_id IS 'Reference to the user who owns this subaccount';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_banking_subaccounts_user_id ON public.banking_subaccounts(user_id);
CREATE INDEX IF NOT EXISTS idx_banking_subaccounts_subaccount_code ON public.banking_subaccounts(subaccount_code);
