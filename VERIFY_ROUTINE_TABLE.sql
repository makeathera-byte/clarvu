-- Quick verification script to check if routine_summaries table exists
-- Run this in Supabase SQL Editor to verify the table was created

-- Check if table exists
SELECT 
  table_name,
  table_schema,
  '✅ Table exists!' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'routine_summaries';

-- If table exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'routine_summaries'
ORDER BY ordinal_position;

-- Check if indexes exist
SELECT 
  indexname,
  '✅ Index exists!' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'routine_summaries';

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS is enabled'
    ELSE '❌ RLS is NOT enabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'routine_summaries';

