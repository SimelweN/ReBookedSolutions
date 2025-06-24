-- Add APS profile storage to profiles table
-- This enables authenticated users to save their APS data across devices and sessions

-- Add APS profile column to profiles table
DO $$ 
BEGIN
    -- Add aps_profile if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'aps_profile') THEN
        ALTER TABLE public.profiles ADD COLUMN aps_profile JSONB DEFAULT NULL;
    END IF;
END $$;

-- Create index for better performance on APS profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_aps_profile ON public.profiles USING GIN(aps_profile);

-- Add helpful comment
COMMENT ON COLUMN public.profiles.aps_profile IS 'User APS profile data including subjects, total APS score, and calculation metadata';

-- Update RLS policies to ensure users can manage their own APS profiles
-- (The existing policies should already cover this new column)

-- Create a function to validate APS profile data structure
CREATE OR REPLACE FUNCTION public.validate_aps_profile(profile_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic validation of APS profile structure
    IF profile_data IS NULL THEN
        RETURN TRUE; -- NULL is valid (no profile set)
    END IF;
    
    -- Check required fields
    IF NOT (profile_data ? 'subjects' AND profile_data ? 'totalAPS' AND profile_data ? 'lastUpdated') THEN
        RETURN FALSE;
    END IF;
    
    -- Check subjects is an array
    IF jsonb_typeof(profile_data->'subjects') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Check totalAPS is a number
    IF jsonb_typeof(profile_data->'totalAPS') != 'number' THEN
        RETURN FALSE;
    END IF;
    
    -- Check lastUpdated is a string (ISO date)
    IF jsonb_typeof(profile_data->'lastUpdated') != 'string' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add constraint to ensure valid APS profile structure
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS valid_aps_profile_structure;

ALTER TABLE public.profiles 
ADD CONSTRAINT valid_aps_profile_structure 
CHECK (validate_aps_profile(aps_profile));

-- Create function to automatically update APS profile timestamp
CREATE OR REPLACE FUNCTION public.update_aps_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- If APS profile is being updated, ensure lastUpdated timestamp is current
    IF NEW.aps_profile IS DISTINCT FROM OLD.aps_profile AND NEW.aps_profile IS NOT NULL THEN
        NEW.aps_profile = jsonb_set(
            NEW.aps_profile, 
            '{lastUpdated}', 
            to_jsonb(NOW()::text)
        );
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for APS profile updates
DROP TRIGGER IF EXISTS update_aps_profile_timestamp_trigger ON public.profiles;
CREATE TRIGGER update_aps_profile_timestamp_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_aps_profile_timestamp();

-- Grant necessary permissions for APS profile operations
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Create helper function to get user's APS profile
CREATE OR REPLACE FUNCTION public.get_user_aps_profile(user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
BEGIN
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Return the APS profile for the user
    RETURN (SELECT aps_profile FROM public.profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to save user's APS profile
CREATE OR REPLACE FUNCTION public.save_user_aps_profile(profile_data JSONB, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Validate profile data
    IF NOT validate_aps_profile(profile_data) THEN
        RAISE EXCEPTION 'Invalid APS profile data structure';
    END IF;
    
    -- Update the user's APS profile
    UPDATE public.profiles 
    SET aps_profile = profile_data 
    WHERE id = user_id;
    
    -- Check if update was successful
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to clear user's APS profile
CREATE OR REPLACE FUNCTION public.clear_user_aps_profile(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Clear the user's APS profile
    UPDATE public.profiles 
    SET aps_profile = NULL 
    WHERE id = user_id;
    
    -- Check if update was successful
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.get_user_aps_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_user_aps_profile(JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_user_aps_profile(UUID) TO authenticated;

-- Verify migration completed successfully
SELECT 'APS profile storage added to profiles table successfully!' as status;
