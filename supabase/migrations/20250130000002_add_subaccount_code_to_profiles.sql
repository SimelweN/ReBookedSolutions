-- Add subaccount_code column to profiles table for Paystack subaccount routing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subaccount_code TEXT;

-- Add comment to explain the purpose
COMMENT ON COLUMN public.profiles.subaccount_code IS 'Paystack subaccount code for routing payments to this seller';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subaccount_code ON public.profiles(subaccount_code);
