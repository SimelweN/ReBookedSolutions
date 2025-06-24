-- RLS Performance Diagnostic Script
-- Run this in your Supabase SQL Editor to check RLS performance issues

-- ====================================================================
-- CURRENT RLS POLICY ANALYSIS
-- ====================================================================

-- 1. Check for inefficient auth.uid() usage
SELECT 
    'INEFFICIENT AUTH CALLS' as issue_type,
    schemaname,
    tablename,
    policyname,
    'Uses direct auth.uid() calls' as problem,
    'Replace with (select auth.uid())' as solution
FROM pg_policies 
WHERE schemaname = 'public'
    AND (qual ~ 'auth\.uid\(\)' AND qual !~ '\(select auth\.uid\(\)\)')
    OR (with_check ~ 'auth\.uid\(\)' AND with_check !~ '\(select auth\.uid\(\)\)')
ORDER BY tablename, policyname;

-- 2. Check for multiple permissive policies
WITH policy_counts AS (
    SELECT 
        schemaname,
        tablename,
        cmd as operation,
        roles,
        COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
        AND permissive = 't'  -- Only permissive policies
    GROUP BY schemaname, tablename, cmd, roles
    HAVING COUNT(*) > 1
)
SELECT 
    'MULTIPLE PERMISSIVE POLICIES' as issue_type,
    tablename,
    operation,
    array_to_string(roles, ', ') as affected_roles,
    policy_count,
    'Consider consolidating into single policy' as solution
FROM policy_counts
ORDER BY tablename, operation;

-- 3. Show all current policies with their efficiency status
SELECT 
    tablename,
    policyname,
    cmd as operation,
    permissive,
    CASE 
        WHEN qual ~ 'auth\.uid\(\)' AND qual !~ '\(select auth\.uid\(\)\)' THEN '❌ INEFFICIENT'
        WHEN with_check ~ 'auth\.uid\(\)' AND with_check !~ '\(select auth\.uid\(\)\)' THEN '❌ INEFFICIENT'
        WHEN qual ~ '\(select auth\.uid\(\)\)' OR with_check ~ '\(select auth\.uid\(\)\)' THEN '✅ OPTIMIZED'
        ELSE '✅ NO AUTH CALLS'
    END as efficiency_status,
    CASE 
        WHEN qual IS NOT NULL THEN left(qual, 100) || '...'
        ELSE 'N/A'
    END as policy_condition
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('banking_details', 'transactions', 'profiles', 'books', 'notifications', 'broadcasts', 'study_resources', 'study_tips', 'reports', 'contact_messages')
ORDER BY tablename, policyname;

-- ====================================================================
-- PERFORMANCE IMPACT ANALYSIS
-- ====================================================================

-- 4. Estimated performance impact by table
WITH table_stats AS (
    SELECT 
        t.table_name,
        COALESCE(s.n_tup_ins + s.n_tup_upd + s.n_tup_del, 0) as write_operations,
        COALESCE(s.seq_scan + s.idx_scan, 0) as read_operations,
        COUNT(p.policyname) as policy_count,
        SUM(CASE 
            WHEN p.qual ~ 'auth\.uid\(\)' AND p.qual !~ '\(select auth\.uid\(\)\)' THEN 1
            WHEN p.with_check ~ 'auth\.uid\(\)' AND p.with_check !~ '\(select auth\.uid\(\)\)' THEN 1
            ELSE 0
        END) as inefficient_policies
    FROM information_schema.tables t
    LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
    LEFT JOIN pg_policies p ON p.tablename = t.table_name AND p.schemaname = 'public'
    WHERE t.table_schema = 'public'
        AND t.table_name IN ('banking_details', 'transactions', 'profiles', 'books', 'notifications', 'broadcasts')
    GROUP BY t.table_name, s.n_tup_ins, s.n_tup_upd, s.n_tup_del, s.seq_scan, s.idx_scan
)
SELECT 
    table_name,
    read_operations,
    write_operations,
    policy_count,
    inefficient_policies,
    CASE 
        WHEN inefficient_policies > 0 AND (read_operations + write_operations) > 1000 THEN '🔴 HIGH IMPACT'
        WHEN inefficient_policies > 0 AND (read_operations + write_operations) > 100 THEN '🟡 MEDIUM IMPACT'
        WHEN inefficient_policies > 0 THEN '🟠 LOW IMPACT'
        ELSE '✅ OPTIMIZED'
    END as performance_impact
FROM table_stats
ORDER BY (read_operations + write_operations) DESC;

-- ====================================================================
-- RECOMMENDED ACTIONS
-- ====================================================================

-- 5. Generate specific recommendations
SELECT 
    'RECOMMENDATIONS' as section,
    'Run the RLS optimization migration to fix all issues' as action,
    'supabase/migrations/20250101000001_optimize_rls_performance.sql' as file_to_run;

SELECT 
    'VERIFICATION' as section,
    'After running migration, execute this diagnostic again' as action,
    'All issues should show as ✅ OPTIMIZED' as expected_result;

-- ====================================================================
-- QUICK FIX GENERATOR
-- ====================================================================

-- 6. Generate quick fix SQL for immediate issues
SELECT 
    'QUICK FIX SQL' as section,
    CASE 
        WHEN qual ~ 'auth\.uid\(\)' AND qual !~ '\(select auth\.uid\(\)\)' THEN
            'DROP POLICY "' || policyname || '" ON ' || schemaname || '.' || tablename || '; -- Then recreate with (select auth.uid())'
        ELSE 'No action needed'
    END as fix_sql
FROM pg_policies 
WHERE schemaname = 'public'
    AND (qual ~ 'auth\.uid\(\)' AND qual !~ '\(select auth\.uid\(\)\)')
    AND tablename IN ('banking_details', 'transactions', 'profiles', 'books', 'notifications')
ORDER BY tablename;

-- Success message
SELECT 
    '🔍 DIAGNOSTIC COMPLETE' as status,
    'Review the results above to understand your RLS performance issues' as next_step,
    'Run the optimization migration to fix all identified problems' as recommendation;
