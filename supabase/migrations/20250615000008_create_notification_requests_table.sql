-- Migration: Create notification_requests table
-- Date: 2025-01-30
-- Description: Creates notification_requests table for user notification subscriptions

-- Create notification_requests table
CREATE TABLE IF NOT EXISTS public.notification_requests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email text NOT NULL,
    notification_type text NOT NULL CHECK (notification_type IN ('accommodation', 'program', 'general')),
    university_id text,
    university_name text,
    program_id text,
    program_name text,
    message text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_requests_user_id ON public.notification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_requests_type ON public.notification_requests(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_requests_status ON public.notification_requests(status);
CREATE INDEX IF NOT EXISTS idx_notification_requests_university_id ON public.notification_requests(university_id);
CREATE INDEX IF NOT EXISTS idx_notification_requests_program_id ON public.notification_requests(program_id);
CREATE INDEX IF NOT EXISTS idx_notification_requests_created_at ON public.notification_requests(created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_notification_requests_updated_at ON public.notification_requests;
CREATE TRIGGER update_notification_requests_updated_at 
    BEFORE UPDATE ON public.notification_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.notification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_requests table
DROP POLICY IF EXISTS "Users can view their own notification requests" ON public.notification_requests;
CREATE POLICY "Users can view their own notification requests" ON public.notification_requests
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own notification requests" ON public.notification_requests;
CREATE POLICY "Users can insert their own notification requests" ON public.notification_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notification requests" ON public.notification_requests;
CREATE POLICY "Users can update their own notification requests" ON public.notification_requests
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own notification requests" ON public.notification_requests;
CREATE POLICY "Users can delete their own notification requests" ON public.notification_requests
    FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all notification requests" ON public.notification_requests;
CREATE POLICY "Admins can manage all notification requests" ON public.notification_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_requests TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.notification_requests IS 'Stores user notification subscription requests for accommodations, programs, and other updates';
COMMENT ON COLUMN public.notification_requests.notification_type IS 'Type of notification: accommodation, program, or general';
COMMENT ON COLUMN public.notification_requests.status IS 'Status of the notification request: pending, sent, or cancelled';

SELECT 'Notification requests table created successfully!' as status;
