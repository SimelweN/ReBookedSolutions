-- Create user_submitted_programs table for program submissions
CREATE TABLE IF NOT EXISTS public.user_submitted_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_name TEXT NOT NULL,
    university_name TEXT NOT NULL,
    faculty_name TEXT NOT NULL,
    submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    aps_requirement INTEGER,
    duration TEXT,
    description TEXT,
    subjects JSONB DEFAULT '[]',
    career_prospects JSONB DEFAULT '[]',
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_submitted_programs_status ON public.user_submitted_programs(status);
CREATE INDEX IF NOT EXISTS idx_user_submitted_programs_submitted_by ON public.user_submitted_programs(submitted_by);
CREATE INDEX IF NOT EXISTS idx_user_submitted_programs_submitted_at ON public.user_submitted_programs(submitted_at);

-- Enable RLS
ALTER TABLE public.user_submitted_programs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own submissions" ON public.user_submitted_programs
    FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "Users can insert their own submissions" ON public.user_submitted_programs
    FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own pending submissions" ON public.user_submitted_programs
    FOR UPDATE USING (
        auth.uid() = submitted_by AND 
        status = 'pending'
    );

-- Admin can view and update all submissions
CREATE POLICY "Admin can view all submissions" ON public.user_submitted_programs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can update all submissions" ON public.user_submitted_programs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_submitted_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on user_submitted_programs table
DROP TRIGGER IF EXISTS update_user_submitted_programs_updated_at ON public.user_submitted_programs;
CREATE TRIGGER update_user_submitted_programs_updated_at
    BEFORE UPDATE ON public.user_submitted_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_user_submitted_programs_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.user_submitted_programs TO authenticated;
GRANT ALL ON public.user_submitted_programs TO service_role;

-- Comment on table
COMMENT ON TABLE public.user_submitted_programs IS 'User-submitted university program data for admin review and approval';
