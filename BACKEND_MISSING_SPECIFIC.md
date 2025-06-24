# 🚨 BACKEND MISSING COMPONENTS - EXACT FIXES NEEDED

## ❌ **CRITICAL: LOADING SPINNER ISSUE**

The loading spinner indicates the **profiles table doesn't exist** or has permission issues.

---

## 🗄️ **1. MISSING DATABASE TABLES (CRITICAL)**

### **❌ profiles Table - CAUSES LOADING SPINNER**

**STATUS: MISSING OR BROKEN - THIS IS WHY YOUR SITE IS LOADING**

**EXACT FIX: Run this in Supabase SQL Editor:**

```sql
-- 1. Create profiles table (CRITICAL - FIXES LOADING SPINNER)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    bio TEXT,
    profile_picture_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    addresses_same BOOLEAN DEFAULT FALSE,
    pickup_address JSONB,
    shipping_address JSONB,
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspension_reason TEXT,
    aps_score INTEGER,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    date_of_birth DATE,
    preferences JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public profiles are visible" ON public.profiles
    FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
```

### **❌ books Table - VERIFY EXISTS**

**EXACT CHECK: Run this to verify:**

```sql
-- Check if books table exists with correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'books' AND table_schema = 'public'
ORDER BY ordinal_position;
```

**If missing, create it:**

```sql
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    condition TEXT NOT NULL,
    category TEXT NOT NULL,
    grade TEXT,
    university_year TEXT,
    image_url TEXT NOT NULL,
    front_cover TEXT,
    back_cover TEXT,
    inside_pages TEXT,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    province TEXT,
    sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS and create policies
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view books" ON public.books
    FOR SELECT USING (NOT sold);
CREATE POLICY "Users can insert their own books" ON public.books
    FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own books" ON public.books
    FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own books" ON public.books
    FOR DELETE USING (auth.uid() = seller_id);
```

### **❌ transactions Table - PAYMENT CRITICAL**

**EXACT CREATE STATEMENT:**

```sql
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL,
    book_title TEXT NOT NULL,
    buyer_id UUID REFERENCES auth.users(id) NOT NULL,
    seller_id UUID REFERENCES auth.users(id) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'paid_pending_seller', 'committed', 'collected', 'completed', 'refunded', 'cancelled'
    )),
    seller_committed BOOLEAN DEFAULT FALSE,
    committed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    paystack_reference TEXT UNIQUE,
    paystack_subaccount_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "System can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
```

### **❌ Other Missing Tables**

```sql
-- notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES public.books(id),
    book_title TEXT NOT NULL,
    reported_user_id UUID REFERENCES auth.users(id),
    reporter_user_id UUID REFERENCES auth.users(id),
    seller_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "Users can view their reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_user_id OR auth.uid() = reported_user_id);

-- contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );
```

---

## ⚡ **2. MISSING EDGE FUNCTIONS (CRITICAL)**

### **❌ Edge Functions NOT DEPLOYED**

**STATUS: EXIST IN CODE BUT NOT DEPLOYED TO SUPABASE**

**EXACT DEPLOY COMMANDS:**

```bash
# 1. Login to Supabase
supabase login

# 2. Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_ID

# 3. Deploy payment functions (CRITICAL)
supabase functions deploy create-paystack-subaccount --project-ref YOUR_PROJECT_ID
supabase functions deploy initialize-paystack-payment --project-ref YOUR_PROJECT_ID
supabase functions deploy verify-paystack-payment --project-ref YOUR_PROJECT_ID
supabase functions deploy paystack-webhook --project-ref YOUR_PROJECT_ID

# 4. Deploy delivery functions (optional but recommended)
supabase functions deploy get-delivery-quotes --project-ref YOUR_PROJECT_ID
supabase functions deploy courier-guy-shipment --project-ref YOUR_PROJECT_ID
supabase functions deploy courier-guy-track --project-ref YOUR_PROJECT_ID
supabase functions deploy fastway-quote --project-ref YOUR_PROJECT_ID
supabase functions deploy fastway-shipment --project-ref YOUR_PROJECT_ID
supabase functions deploy fastway-track --project-ref YOUR_PROJECT_ID
```

---

## 🔐 **3. MISSING ENVIRONMENT VARIABLES (CRITICAL)**

### **❌ Edge Function Environment Variables**

**STATUS: NOT SET IN SUPABASE**

**EXACT COMMANDS:**

```bash
# Set Paystack secret key (CRITICAL)
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here --project-ref YOUR_PROJECT_ID

# Verify it was set
supabase secrets list --project-ref YOUR_PROJECT_ID
```

**Alternative: Set in Supabase Dashboard**

1. Go to **Supabase Dashboard → Your Project → Settings → Edge Functions**
2. Add environment variable:
   - **Name:** `PAYSTACK_SECRET_KEY`
   - **Value:** `sk_test_your_secret_key` (or `sk_live_` for production)

### **❌ Local Environment Variables**

**STATUS: MAY BE MISSING IN .env.local**

**EXACT FILE: `.env.local`**

```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🔧 **4. MISSING DATABASE FUNCTIONS**

```sql
-- Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_banking_details_updated_at
    BEFORE UPDATE ON public.banking_details
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

## 🎯 **5. PAYSTACK WEBHOOK CONFIGURATION**

### **❌ Webhook URL Not Set in Paystack Dashboard**

**EXACT STEPS:**

1. Go to **Paystack Dashboard → Settings → Webhooks**
2. Add webhook URL: `https://YOUR-PROJECT-ID.supabase.co/functions/v1/paystack-webhook`
3. Select events:
   - `charge.success`
   - `transfer.success`
   - `transfer.failed`

---

## 🚨 **IMMEDIATE PRIORITY ORDER**

### **1. FIX LOADING SPINNER (CRITICAL)**

```sql
-- Run the profiles table creation SQL above
-- This will immediately fix the loading spinner
```

### **2. DEPLOY EDGE FUNCTIONS**

```bash
supabase functions deploy create-paystack-subaccount
supabase functions deploy initialize-paystack-payment
supabase functions deploy verify-paystack-payment
```

### **3. SET ENVIRONMENT VARIABLES**

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_your_key
```

### **4. CREATE REMAINING TABLES**

```sql
-- Run transactions, notifications, reports, contact_messages SQL
```

### **5. CONFIGURE PAYSTACK WEBHOOK**

```
https://your-project.supabase.co/functions/v1/paystack-webhook
```

---

## 🧪 **VERIFICATION COMMANDS**

### **Check Tables Exist:**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'books', 'transactions', 'banking_details', 'notifications', 'reports', 'contact_messages');
```

### **Check Edge Functions:**

```bash
supabase functions list --project-ref YOUR_PROJECT_ID
```

### **Check Environment Variables:**

```bash
supabase secrets list --project-ref YOUR_PROJECT_ID
```

---

## 🎯 **ROOT CAUSE OF LOADING SPINNER**

The loading spinner is caused by:

1. **profiles table doesn't exist** - AuthContext hangs waiting for profile data
2. **RLS policies missing** - User can't access their profile
3. **Edge Functions not deployed** - Banking service fails

**Fix the profiles table FIRST** and the loading spinner will disappear immediately!

**After fixing profiles table, your site will load and you can test the payment system once Edge Functions are deployed.**
