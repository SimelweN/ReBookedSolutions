-- Create banking_details table for secure storage of user banking information
CREATE TABLE IF NOT EXISTS public.banking_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_type TEXT NOT NULL,
    full_name TEXT NOT NULL, -- Encrypted
    bank_account_number TEXT NOT NULL, -- Encrypted
    bank_name TEXT NOT NULL,
    branch_code TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'current')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.banking_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for banking_details
-- Users can only see and modify their own banking details
CREATE POLICY "Users can view their own banking details" ON public.banking_details
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own banking details" ON public.banking_details
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own banking details" ON public.banking_details
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own banking details" ON public.banking_details
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to banking_details table
CREATE TRIGGER handle_banking_details_updated_at
    BEFORE UPDATE ON public.banking_details
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_details TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.banking_details IS 'Stores encrypted banking details for users with strong security measures';
COMMENT ON COLUMN public.banking_details.full_name IS 'Encrypted full name of account holder';
COMMENT ON COLUMN public.banking_details.bank_account_number IS 'Encrypted bank account number';
COMMENT ON COLUMN public.banking_details.recipient_type IS 'Type of recipient (individual, business, etc.)';
COMMENT ON COLUMN public.banking_details.account_type IS 'Type of bank account (savings or current)';
