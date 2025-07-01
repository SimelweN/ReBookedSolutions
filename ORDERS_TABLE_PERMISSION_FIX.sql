-- Fix for orders table permission issues
-- Run this in your Supabase SQL Editor

-- First, let's fix the RLS policies to avoid auth.users access issues
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own orders as seller" ON public.orders;
DROP POLICY IF EXISTS "Users can view orders with their email as buyer" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders as seller" ON public.orders;

-- Create simpler, working policies
CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (
        auth.uid() = seller_id OR 
        buyer_email = auth.email()
    );

CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (
        auth.uid() = seller_id
    ) WITH CHECK (
        auth.uid() = seller_id
    );

-- Grant proper permissions
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Test the table access (this should work now)
SELECT 
    count(*) as order_count,
    'Orders table is accessible' as status
FROM public.orders;
