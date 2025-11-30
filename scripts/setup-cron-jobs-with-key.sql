-- ============================================
-- DayFlow Cron Jobs Setup Script (AUTO-GENERATED)
-- ============================================
-- This file was generated automatically with your service role key.
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Daily Summary (hourly)
SELECT cron.unschedule('daily-summary-hourly') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-summary-hourly');

SELECT cron.schedule(
  'daily-summary-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGV4bHF2b2ZzeGlham1ld2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMyODg1NCwiZXhwIjoyMDc5OTA0ODU0fQ.CZ5BeyzGwfAX4xFpiwxT6vKzHzmsOBVvVtgsDNemUXg',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Weekly Summary (Sunday 3 AM UTC)
SELECT cron.unschedule('weekly-summary-sunday') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-summary-sunday');

SELECT cron.schedule(
  'weekly-summary-sunday',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/weekly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGV4bHF2b2ZzeGlham1ld2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMyODg1NCwiZXhwIjoyMDc5OTA0ODU0fQ.CZ5BeyzGwfAX4xFpiwxT6vKzHzmsOBVvVtgsDNemUXg',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Monthly Summary (2nd of month, 3 AM UTC)
SELECT cron.unschedule('monthly-summary-2nd') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'monthly-summary-2nd');

SELECT cron.schedule(
  'monthly-summary-2nd',
  '0 3 2 * *',
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/monthly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGV4bHF2b2ZzeGlham1ld2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMyODg1NCwiZXhwIjoyMDc5OTA0ODU0fQ.CZ5BeyzGwfAX4xFpiwxT6vKzHzmsOBVvVtgsDNemUXg',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Verify cron jobs were created
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  CASE WHEN active THEN '✅ Active' ELSE '❌ Inactive' END as status
FROM cron.job 
WHERE jobname IN ('daily-summary-hourly', 'weekly-summary-sunday', 'monthly-summary-2nd')
ORDER BY jobname;