-- Add encryption columns to banking_details table
ALTER TABLE banking_details 
ADD COLUMN IF NOT EXISTS encrypted_data TEXT,
ADD COLUMN IF NOT EXISTS encryption_salt TEXT,
ADD COLUMN IF NOT EXISTS fields_encrypted TEXT[],
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_banking_details_user_id ON banking_details(user_id);
CREATE INDEX IF NOT EXISTS idx_banking_details_encryption ON banking_details(user_id, password_hash) WHERE encrypted_data IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN banking_details.encrypted_data IS 'AES encrypted sensitive banking data using user password';
COMMENT ON COLUMN banking_details.encryption_salt IS 'Salt used for key derivation from user password';
COMMENT ON COLUMN banking_details.fields_encrypted IS 'Array of field names that are encrypted';
COMMENT ON COLUMN banking_details.password_hash IS 'SHA256 hash of user password for verification';

-- Update RLS policies to handle encrypted data
DROP POLICY IF EXISTS "Users can only access their own banking details" ON banking_details;
CREATE POLICY "Users can only access their own banking details" ON banking_details
    FOR ALL USING (auth.uid()::text = user_id);

-- Add policy for encrypted data access
CREATE POLICY "Users can access encrypted banking details" ON banking_details
    FOR SELECT USING (
        auth.uid()::text = user_id 
        AND (encrypted_data IS NOT NULL OR bank_account_number IS NOT NULL)
    );
