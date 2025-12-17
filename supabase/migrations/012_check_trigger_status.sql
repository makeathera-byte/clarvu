-- Check if profile creation trigger exists and works correctly
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_name = 'create_default_categories';

-- 3. Test profile creation manually (replace USER_ID with actual user ID)
-- SELECT * FROM profiles WHERE id = 'USER_ID';
