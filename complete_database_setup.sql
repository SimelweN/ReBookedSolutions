-- Complete Database Setup Script
-- Run this script in your Supabase SQL editor to fix all loading spinner issues
-- This creates all missing tables and fixes permissions

-- 1. PROFILES TABLE (Critical - main cause of loading spinner)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    bio TEXT,
    profile_picture_url TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    phone TEXT,
    university TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'South Africa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS and create policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- 2. BOOKS TABLE (if missing)
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'very_good', 'good', 'acceptable')),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    subject TEXT,
    university TEXT,
    course_code TEXT,
    year INTEGER,
    semester TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'unlisted')),
    views INTEGER DEFAULT 0,
    province TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS and create policies for books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Books are viewable by everyone" ON public.books
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own books" ON public.books
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own books" ON public.books
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own books" ON public.books
    FOR DELETE USING (auth.uid() = user_id);

-- 3. TRANSACTIONS TABLE (for payment system)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    transaction_reference TEXT NOT NULL UNIQUE,
    paystack_reference TEXT UNIQUE,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'paid_pending_seller', 'committed', 'collected', 'completed', 'cancelled', 'refunded'
    )),
    payment_method TEXT DEFAULT 'paystack',
    shipping_info JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS and create policies for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY IF NOT EXISTS "Users can update their own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
    WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 4. BANKING DETAILS TABLE (for payment system)
CREATE TABLE IF NOT EXISTS public.banking_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_type TEXT NOT NULL,
    full_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    branch_code TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'current')),
    paystack_subaccount_code TEXT,
    paystack_subaccount_id TEXT,
    subaccount_status TEXT DEFAULT 'pending' CHECK (subaccount_status IN ('pending', 'active', 'inactive')),
    account_verified BOOLEAN DEFAULT false NOT NULL,
    -- Encryption fields
    encrypted_data TEXT,
    encryption_salt TEXT,
    fields_encrypted BOOLEAN DEFAULT false,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS and create policies for banking_details
ALTER TABLE public.banking_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own banking details" ON public.banking_details
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own banking details" ON public.banking_details
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own banking details" ON public.banking_details
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own banking details" ON public.banking_details
    FOR DELETE USING (auth.uid() = user_id);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS and create policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- 6. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for contact_messages (admin access)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can view their own contact messages" ON public.contact_messages
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- 7. REPORTS TABLE (for moderation)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    resolution TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can insert reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY IF NOT EXISTS "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- 8. CREATE ESSENTIAL FUNCTIONS

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, bio, profile_picture_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        NULL,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CREATE TRIGGERS

-- Updated at triggers
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_books_updated_at ON public.books;
CREATE TRIGGER handle_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_transactions_updated_at ON public.transactions;
CREATE TRIGGER handle_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_banking_details_updated_at ON public.banking_details;
CREATE TRIGGER handle_banking_details_updated_at
    BEFORE UPDATE ON public.banking_details
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER handle_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_reports_updated_at ON public.reports;
CREATE TRIGGER handle_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. GRANT PERMISSIONS

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_details TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT ON public.contact_messages TO authenticated;
GRANT SELECT, INSERT ON public.reports TO authenticated;

-- Grant read access to anonymous users for public content
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.books TO anon;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 11. CREATE INDEXES FOR PERFORMANCE

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);
CREATE INDEX IF NOT EXISTS profiles_university_idx ON public.profiles(university);

-- Books indexes
CREATE INDEX IF NOT EXISTS books_user_id_idx ON public.books(user_id);
CREATE INDEX IF NOT EXISTS books_status_idx ON public.books(status);
CREATE INDEX IF NOT EXISTS books_university_idx ON public.books(university);
CREATE INDEX IF NOT EXISTS books_subject_idx ON public.books(subject);
CREATE INDEX IF NOT EXISTS books_province_idx ON public.books(province);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS transactions_buyer_id_idx ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS transactions_seller_id_idx ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS transactions_book_id_idx ON public.transactions(book_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions(status);
CREATE INDEX IF NOT EXISTS transactions_reference_idx ON public.transactions(transaction_reference);

-- Banking details indexes
CREATE INDEX IF NOT EXISTS banking_details_user_id_idx ON public.banking_details(user_id);
CREATE INDEX IF NOT EXISTS banking_details_subaccount_status_idx ON public.banking_details(subaccount_status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);

-- Reports indexes
CREATE INDEX IF NOT EXISTS reports_reporter_id_idx ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);

-- 12. ADD HELPFUL COMMENTS

COMMENT ON TABLE public.profiles IS 'User profiles with extended information - CRITICAL for app loading';
COMMENT ON TABLE public.books IS 'Book listings and marketplace inventory';
COMMENT ON TABLE public.transactions IS 'Payment transactions for book purchases';
COMMENT ON TABLE public.banking_details IS 'Encrypted banking details for payments';
COMMENT ON TABLE public.notifications IS 'User notifications and alerts';
COMMENT ON TABLE public.contact_messages IS 'Contact form submissions';
COMMENT ON TABLE public.reports IS 'Content moderation reports';

-- Verification and completion message
SELECT 
    'DATABASE SETUP COMPLETE!' as status,
    'All critical tables created successfully' as message,
    'Loading spinner issue should now be resolved' as note;

-- Show created tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'books', 'transactions', 'banking_details', 'notifications', 'contact_messages', 'reports')
ORDER BY table_name;
