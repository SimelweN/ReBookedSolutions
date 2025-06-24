-- Add account_verified field to banking_details table
-- This field indicates whether the banking details have been verified and can be used for payments

DO $$
BEGIN
    -- Check if column exists before adding it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'banking_details' 
        AND column_name = 'account_verified'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.banking_details 
        ADD COLUMN account_verified BOOLEAN DEFAULT false NOT NULL;
        
        -- Add comment for the new column
        COMMENT ON COLUMN public.banking_details.account_verified IS 'Whether the banking details have been verified and can be used for payments';
        
        -- Update existing records where paystack_subaccount_code exists to be verified
        UPDATE public.banking_details 
        SET account_verified = true 
        WHERE paystack_subaccount_code IS NOT NULL;
        
    END IF;
END $$;
