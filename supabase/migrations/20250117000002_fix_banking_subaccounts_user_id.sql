-- Fix banking_subaccounts table to ensure user_id column exists
-- This addresses the "column banking_subaccounts.user_id does not exist" error

-- First, check if the table exists and create it if not
CREATE TABLE IF NOT EXISTS public.banking_subaccounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    email TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    bank_code TEXT NOT NULL,
    account_number TEXT NOT NULL,
    subaccount_code TEXT NULL,
    paystack_response JSONB NULL,
    status TEXT NULL DEFAULT 'pending'::text,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW()
);

-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'banking_subaccounts' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.banking_subaccounts 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Add status check constraint if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'banking_subaccounts_status_check'
    ) THEN
        ALTER TABLE public.banking_subaccounts 
        ADD CONSTRAINT banking_subaccounts_status_check 
        CHECK (status = ANY(ARRAY['pending'::text, 'active'::text, 'failed'::text]));
    END IF;
END $$;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.banking_subaccounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Users can view their own subaccount" ON public.banking_subaccounts;
DROP POLICY IF EXISTS "Users can insert their own subaccount" ON public.banking_subaccounts;
DROP POLICY IF EXISTS "Users can update their own subaccount" ON public.banking_subaccounts;
DROP POLICY IF EXISTS "Users can delete their own subaccount" ON public.banking_subaccounts;

-- Create RLS policies
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

-- Create updated_at trigger if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND trigger_name = 'set_timestamp'
        AND event_object_table = 'banking_subaccounts'
    ) THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE ON public.banking_subaccounts
            FOR EACH ROW
            EXECUTE FUNCTION trigger_set_timestamp();
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_subaccounts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_banking_subaccounts_user_id ON public.banking_subaccounts(user_id);
CREATE INDEX IF NOT EXISTS idx_banking_subaccounts_subaccount_code ON public.banking_subaccounts(subaccount_code);
CREATE INDEX IF NOT EXISTS idx_banking_subaccounts_email ON public.banking_subaccounts(email);

-- Add helpful comments
COMMENT ON TABLE public.banking_subaccounts IS 'Stores Paystack subaccount information for users';
COMMENT ON COLUMN public.banking_subaccounts.subaccount_code IS 'Paystack subaccount code for payment routing';
COMMENT ON COLUMN public.banking_subaccounts.user_id IS 'Reference to the user who owns this subaccount';
