-- Fix books table schema issues
-- Add missing columns that the frontend expects

-- Add availability column if it doesn't exist
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available' 
CHECK (availability IN ('available', 'unavailable', 'sold'));

-- Create index for availability for better query performance
CREATE INDEX IF NOT EXISTS idx_books_availability ON public.books (availability);

-- Update existing books to have proper availability status
-- Books that are sold should have availability = 'sold'
UPDATE public.books 
SET availability = 'sold' 
WHERE sold = true AND (availability IS NULL OR availability != 'sold');

-- Books that are not sold should have availability = 'available'
UPDATE public.books 
SET availability = 'available' 
WHERE sold = false AND (availability IS NULL OR availability = 'sold');

-- Add updated_at column for tracking changes (optional)
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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

-- Add comments
COMMENT ON COLUMN public.books.availability IS 'Book availability status: available, unavailable, or sold';
COMMENT ON COLUMN public.books.updated_at IS 'Timestamp of last update';

-- Success message
SELECT 
    'BOOKS TABLE SCHEMA FIX COMPLETE!' as status,
    'Added availability and updated_at columns' as schema_changes,
    'Updated existing data to proper availability status' as data_migration,
    'Added indexes for better performance' as performance_optimization;
