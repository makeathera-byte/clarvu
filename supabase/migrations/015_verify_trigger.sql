-- Migration: Verify trigger exists and works correctly
-- Run this in Supabase SQL Editor to verify the trigger is set up correctly

-- 1. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users';

-- Expected result: Should show one row with trigger_name = 'on_auth_user_created'

-- 2. Check if the function exists
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- Expected result: Should show one row with routine_name = 'handle_new_user' and security_type = 'DEFINER'

-- 3. Verify RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
AND schemaname = 'public';

-- Expected results: Should show policies for SELECT, UPDATE, and INSERT

-- 4. Test: Check recent profiles (replace with actual user ID if testing)
-- SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;


