-- Fix books table schema issues - SPECIFIC UPDATES
-- Add missing columns that the frontend expects

-- ====================================================================
-- BOOKS TABLE SPECIFIC SCHEMA FIXES
-- ====================================================================

-- 1. Add availability column with exact enum values
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available';

-- Add specific constraint for availability values
ALTER TABLE public.books
DROP CONSTRAINT IF EXISTS books_availability_check;
ALTER TABLE public.books
ADD CONSTRAINT books_availability_check
CHECK (availability IN ('available', 'unavailable', 'sold'));

-- 2. Add updated_at column for BookDeletionService
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Add university column (frontend Book interface expects this)
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS university TEXT;

-- ====================================================================
-- DATA MIGRATION - Update existing records
-- ====================================================================

-- Set availability based on sold status for existing records
UPDATE public.books
SET availability = CASE
    WHEN sold = true THEN 'sold'
    ELSE 'available'
END
WHERE availability IS NULL;

-- ====================================================================
-- INDEXES - Specific performance optimizations
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_books_availability ON public.books (availability);
CREATE INDEX IF NOT EXISTS idx_books_availability_sold ON public.books (availability, sold);
CREATE INDEX IF NOT EXISTS idx_books_university ON public.books (university);
CREATE INDEX IF NOT EXISTS idx_books_seller_availability ON public.books (seller_id, availability);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies to include availability column
DROP POLICY IF EXISTS "books_public_view" ON public.books;
CREATE POLICY "books_public_view" ON public.books
    FOR SELECT
    USING (true);

-- Ensure books have proper seller_id reference
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'books_seller_id_fkey'
    ) THEN
        ALTER TABLE public.books
        ADD CONSTRAINT books_seller_id_fkey
        FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_seller_id ON public.books (seller_id);
CREATE INDEX IF NOT EXISTS idx_books_sold ON public.books (sold);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books (created_at);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books (category);
CREATE INDEX IF NOT EXISTS idx_books_province ON public.books (province);

-- ====================================================================
-- PROFILES TABLE - Address Format Consistency
-- ====================================================================

-- Add constraint to ensure pickup_address has required fields
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS pickup_address_format_check;
ALTER TABLE public.profiles
ADD CONSTRAINT pickup_address_format_check CHECK (
    pickup_address IS NULL OR (
        pickup_address ? 'city' AND
        pickup_address ? 'province' AND
        pickup_address ? 'postalCode' AND
        (pickup_address ? 'street' OR pickup_address ? 'streetAddress')
    )
);

-- Migrate existing addresses to include both street formats
UPDATE public.profiles
SET pickup_address = pickup_address || jsonb_build_object('streetAddress', pickup_address->>'street')
WHERE pickup_address ? 'street' AND NOT pickup_address ? 'streetAddress';

UPDATE public.profiles
SET shipping_address = shipping_address || jsonb_build_object('streetAddress', shipping_address->>'street')
WHERE shipping_address ? 'street' AND NOT shipping_address ? 'streetAddress';

-- ====================================================================
-- COLUMN COMMENTS - Documentation
-- ====================================================================

COMMENT ON COLUMN public.books.availability IS 'Book availability status: available, unavailable, or sold';
COMMENT ON COLUMN public.books.updated_at IS 'Timestamp of last update (auto-updated by trigger)';
COMMENT ON COLUMN public.books.university IS 'University name for university-level textbooks';
COMMENT ON CONSTRAINT pickup_address_format_check ON public.profiles IS 'Ensures pickup address has required fields: city, province, postalCode, and street/streetAddress';

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================

-- Check books table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'books'
    AND table_schema = 'public'
    AND column_name IN ('availability', 'updated_at', 'university')
ORDER BY column_name;

-- Success message
SELECT
    'DATABASE SCHEMA FIX COMPLETE!' as status,
    'Books table: Added availability, updated_at, university columns' as books_changes,
    'Profiles table: Fixed address format consistency' as profiles_changes,
    'Added proper constraints and indexes' as validation_added;
