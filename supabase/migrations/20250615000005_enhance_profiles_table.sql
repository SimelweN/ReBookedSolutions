-- Enhance existing profiles table with additional user details
-- This extends the current profiles table instead of creating a duplicate account_details table

-- Add missing columns to existing profiles table if they don't exist
DO $$ 
BEGIN
    -- Add first_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add phone_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
    END IF;
    
    -- Add date_of_birth if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
    END IF;
    
    -- Add preferences if it doesn't exist (note: already has pickup_address, shipping_address as JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    
    -- Add user verification status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add phone verification status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON public.profiles(email_verified);

-- Update RLS policies to ensure proper access (extend existing policies)
-- Note: The existing policies should already cover these new columns

-- Create a function to automatically populate first_name and last_name from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.populate_profile_names()
RETURNS TRIGGER AS $$
BEGIN
    -- Only populate if the fields are empty and we have metadata
    IF NEW.first_name IS NULL AND NEW.raw_user_meta_data ? 'first_name' THEN
        NEW.first_name := NEW.raw_user_meta_data ->> 'first_name';
    END IF;
    
    IF NEW.last_name IS NULL AND NEW.raw_user_meta_data ? 'last_name' THEN
        NEW.last_name := NEW.raw_user_meta_data ->> 'last_name';
    END IF;
    
    -- If we have separate first/last names but no combined name, create it
    IF NEW.name IS NULL AND NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN
        NEW.name := NEW.first_name || ' ' || NEW.last_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new profile creation/updates
DROP TRIGGER IF EXISTS populate_profile_names_trigger ON public.profiles;
CREATE TRIGGER populate_profile_names_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW 
    EXECUTE FUNCTION public.populate_profile_names();

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.first_name IS 'User first name extracted from auth metadata or manually entered';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name extracted from auth metadata or manually entered';
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number for verification and communication';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth for age verification if needed';
COMMENT ON COLUMN public.profiles.preferences IS 'User preferences and settings as JSON object';
COMMENT ON COLUMN public.profiles.email_verified IS 'Whether user email has been verified';
COMMENT ON COLUMN public.profiles.phone_verified IS 'Whether user phone number has been verified';

-- Create a view for easy access to user account details (maintains compatibility with your intended use)
CREATE OR REPLACE VIEW public.account_details AS
SELECT 
    id,
    id as user_id, -- For compatibility with your intended schema
    first_name,
    last_name,
    name as full_name,
    phone_number,
    date_of_birth,
    CASE 
        WHEN pickup_address IS NOT NULL OR shipping_address IS NOT NULL THEN
            jsonb_build_object(
                'pickup', pickup_address,
                'shipping', shipping_address,
                'same', addresses_same
            )
        ELSE NULL 
    END as address,
    profile_picture_url,
    bio,
    preferences,
    email_verified,
    phone_verified,
    created_at,
    updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.account_details TO authenticated;

-- Enable RLS on the view (inherits from profiles table policies)
ALTER VIEW public.account_details SET (security_barrier = true);

-- Create RLS policy for the view
CREATE POLICY "Users can view their own account details via view" 
    ON public.profiles -- Policy applies to underlying table
    FOR SELECT 
    USING (auth.uid() = id); -- Users can only see their own data
