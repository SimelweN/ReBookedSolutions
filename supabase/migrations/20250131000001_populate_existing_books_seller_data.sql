-- Populate existing books with seller address and subaccount data
-- This ensures all books have the data needed for efficient checkout

-- Update books that don't have seller address data
UPDATE public.books 
SET 
    seller_street = p.pickup_address->>'streetAddress',
    seller_city = p.pickup_address->>'city',
    seller_province = p.pickup_address->>'province',
    seller_postal_code = p.pickup_address->>'postalCode',
    seller_country = 'South Africa',
    -- Also ensure province field is populated
    province = p.pickup_address->>'province'
FROM public.profiles p 
WHERE public.books.seller_id = p.id
    AND p.pickup_address IS NOT NULL
    AND (
        public.books.seller_street IS NULL 
        OR public.books.seller_city IS NULL 
        OR public.books.seller_province IS NULL 
        OR public.books.seller_postal_code IS NULL
    );

-- Update books that don't have seller_subaccount_code but have subaccount_code
UPDATE public.books 
SET seller_subaccount_code = subaccount_code
WHERE seller_subaccount_code IS NULL 
    AND subaccount_code IS NOT NULL;

-- For books where seller doesn't have subaccount_code but has banking data, populate from banking_subaccounts
UPDATE public.books 
SET 
    seller_subaccount_code = bs.subaccount_code,
    subaccount_code = bs.subaccount_code
FROM public.banking_subaccounts bs 
WHERE public.books.seller_id = bs.user_id
    AND bs.subaccount_code IS NOT NULL
    AND public.books.seller_subaccount_code IS NULL;

-- Add helpful indexes for the new checkout flow
CREATE INDEX IF NOT EXISTS idx_books_seller_address_complete ON public.books (
    seller_street, seller_city, seller_province, seller_postal_code
) WHERE seller_street IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_books_checkout_ready ON public.books (
    seller_subaccount_code, seller_city, seller_province
) WHERE seller_subaccount_code IS NOT NULL AND seller_city IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.books.seller_subaccount_code IS 'Redundant field for easy access - same as subaccount_code';

-- Success message
SELECT 
    'SELLER DATA POPULATION COMPLETE!' as status,
    'Books now contain seller address and subaccount data for efficient checkout' as description,
    'New book listings will automatically include this data' as note;
