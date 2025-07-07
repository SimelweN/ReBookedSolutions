-- Add seller address and subaccount columns to books table
-- This allows us to store seller data with each book listing for faster checkout

-- Add seller address columns
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS seller_street TEXT,
ADD COLUMN IF NOT EXISTS seller_city TEXT,
ADD COLUMN IF NOT EXISTS seller_province TEXT,
ADD COLUMN IF NOT EXISTS seller_postal_code TEXT,
ADD COLUMN IF NOT EXISTS seller_country TEXT DEFAULT 'South Africa',
ADD COLUMN IF NOT EXISTS seller_subaccount_code TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_books_seller_subaccount_code ON public.books(seller_subaccount_code);
CREATE INDEX IF NOT EXISTS idx_books_seller_city ON public.books(seller_city);
CREATE INDEX IF NOT EXISTS idx_books_seller_province ON public.books(seller_province);

-- Add helpful comments
COMMENT ON COLUMN public.books.seller_street IS 'Seller pickup street address for delivery calculations';
COMMENT ON COLUMN public.books.seller_city IS 'Seller pickup city for delivery calculations';
COMMENT ON COLUMN public.books.seller_province IS 'Seller pickup province for delivery calculations';
COMMENT ON COLUMN public.books.seller_postal_code IS 'Seller pickup postal code for delivery calculations';
COMMENT ON COLUMN public.books.seller_country IS 'Seller pickup country for delivery calculations';
COMMENT ON COLUMN public.books.seller_subaccount_code IS 'Paystack subaccount code for payment routing to seller';

-- Add constraint to ensure if seller address is provided, all required fields are present
ALTER TABLE public.books 
ADD CONSTRAINT check_seller_address_complete 
CHECK (
  (seller_street IS NULL AND seller_city IS NULL AND seller_province IS NULL AND seller_postal_code IS NULL) 
  OR 
  (seller_street IS NOT NULL AND seller_city IS NOT NULL AND seller_province IS NOT NULL AND seller_postal_code IS NOT NULL)
);
