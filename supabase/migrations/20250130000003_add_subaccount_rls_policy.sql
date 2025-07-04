-- Enable RLS on books table if not already enabled
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow book insertion if user has subaccount_code
CREATE POLICY "require_subaccount_for_book_insert" 
ON books 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.subaccount_code IS NOT NULL 
    AND TRIM(profiles.subaccount_code) != ''
  )
);

-- Add comment explaining the policy
COMMENT ON POLICY "require_subaccount_for_book_insert" ON books IS 
'Prevents book insertion unless user has completed banking setup (subaccount_code)';
