-- Fix books table RLS policy to use correct column name
-- The policy was using 'user_id' but books table has 'seller_id'

-- Drop the incorrect policy
DROP POLICY IF EXISTS "books_owner_manage" ON public.books;

-- Create correct policy using seller_id
CREATE POLICY "books_owner_manage" ON public.books
    FOR ALL
    USING ((select auth.uid()) = seller_id)
    WITH CHECK ((select auth.uid()) = seller_id);

-- Ensure public viewing policy exists
DROP POLICY IF EXISTS "books_public_view" ON public.books;
CREATE POLICY "books_public_view" ON public.books
    FOR SELECT
    USING (true);

-- Add comment for documentation
COMMENT ON POLICY "books_owner_manage" ON public.books IS 
'Allows book owners to manage their own books using seller_id column';

-- Success message
SELECT 
    'BOOKS RLS POLICY FIXED!' as status,
    'Policy now correctly uses seller_id instead of user_id' as description;
