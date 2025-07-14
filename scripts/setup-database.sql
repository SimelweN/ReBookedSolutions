-- ReBooked Solutions Database Setup
-- Run this script in your Supabase SQL editor

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  profile_picture_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  subaccount_code TEXT,
  phone TEXT,
  address JSONB
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  condition TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  university_id TEXT,
  course_code TEXT,
  status TEXT DEFAULT 'available',
  sold BOOLEAN DEFAULT FALSE,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  book_type TEXT DEFAULT 'physical',
  province TEXT,
  city TEXT
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  delivery_method TEXT,
  delivery_address JSONB,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  committed_at TIMESTAMP WITH TIME ZONE,
  collected_at TIMESTAMP WITH TIME ZONE
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  paystack_response JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  metadata JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create banking_subaccounts table
CREATE TABLE IF NOT EXISTS banking_subaccounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  settlement_bank TEXT NOT NULL,
  account_number TEXT NOT NULL,
  subaccount_code TEXT UNIQUE NOT NULL,
  percentage_charge DECIMAL(5,2) DEFAULT 0.0,
  status TEXT DEFAULT 'active',
  paystack_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study resources tables
CREATE TABLE IF NOT EXISTS study_resource_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT,
  province TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  subject TEXT,
  academic_level TEXT,
  category_id UUID REFERENCES study_resource_categories(id) ON DELETE SET NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  tags TEXT[],
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_resource_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES study_resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_subaccounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_resource_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Books policies
CREATE POLICY "Anyone can view available books" ON books FOR SELECT USING (status = 'available');
CREATE POLICY "Users can create books" ON books FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own books" ON books FOR UPDATE USING (auth.uid() = seller_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update orders" ON orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Banking subaccounts policies
CREATE POLICY "Users can view own banking details" ON banking_subaccounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create banking details" ON banking_subaccounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own banking details" ON banking_subaccounts FOR UPDATE USING (auth.uid() = user_id);

-- Study resources policies
CREATE POLICY "Anyone can view active study resources" ON study_resources FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create study resources" ON study_resources FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update own study resources" ON study_resources FOR UPDATE USING (auth.uid() = created_by);

-- Downloads policies
CREATE POLICY "Users can view own downloads" ON study_resource_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can record downloads" ON study_resource_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_seller_id ON books(seller_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Insert default categories
INSERT INTO study_resource_categories (name, description) VALUES 
('Notes', 'Study notes and summaries'),
('Past Papers', 'Previous exam papers and tests'),
('Textbooks', 'Digital textbooks and references'),
('Assignments', 'Sample assignments and projects')
ON CONFLICT DO NOTHING;

-- Insert sample institutions
INSERT INTO institutions (name, abbreviation, province) VALUES 
('University of Cape Town', 'UCT', 'Western Cape'),
('University of the Witwatersrand', 'WITS', 'Gauteng'),
('Stellenbosch University', 'SU', 'Western Cape'),
('University of Pretoria', 'UP', 'Gauteng'),
('University of KwaZulu-Natal', 'UKZN', 'KwaZulu-Natal')
ON CONFLICT DO NOTHING;

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banking_subaccounts_updated_at BEFORE UPDATE ON banking_subaccounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_resources_updated_at BEFORE UPDATE ON study_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RPC function to get table names for the dev dashboard
-- This function returns a list of all tables in the public schema
CREATE OR REPLACE FUNCTION get_table_names()
RETURNS TABLE (
  table_name TEXT,
  table_schema TEXT,
  table_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::TEXT,
    t.table_schema::TEXT,
    t.table_type::TEXT
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION get_table_names() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION get_table_names() IS 'Returns list of tables in public schema for development dashboard';

-- Create realtime subscriptions
SELECT cron.schedule('cleanup-expired-orders', '*/5 * * * *', 'SELECT 1'); -- Placeholder for cleanup jobs

COMMENT ON TABLE profiles IS 'User profiles and settings';
COMMENT ON TABLE books IS 'Book listings for sale';
COMMENT ON TABLE orders IS 'Purchase orders and transactions';
COMMENT ON TABLE payments IS 'Payment records and tracking';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE audit_logs IS 'System audit trail';
