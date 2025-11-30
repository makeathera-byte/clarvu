-- ============================================
-- DayFlow Cron Jobs Setup Script
-- ============================================
-- This script sets up automated summary generation
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Enable http extension (for making HTTP requests)
CREATE EXTENSION IF NOT EXISTS http;

-- IMPORTANT: Replace 'YOUR_SERVICE_ROLE_KEY' below with your actual service role key
-- You can find it in: Supabase Dashboard -> Settings -> API -> Service Role Key (secret)
-- Copy the entire key and replace 'YOUR_SERVICE_ROLE_KEY' in all three cron jobs

-- ============================================
-- Daily Summary Cron Job
-- Runs every hour to check user-specific times
-- ============================================

-- Remove existing job if it exists
SELECT cron.unschedule('daily-summary-hourly') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-summary-hourly'
);

-- Create daily summary cron job
SELECT cron.schedule(
  'daily-summary-hourly',           -- Job name
  '0 * * * *',                      -- Schedule: Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- ============================================
-- Weekly Summary Cron Job
-- Runs every Sunday at 3 AM UTC
-- ============================================

-- Remove existing job if it exists
SELECT cron.unschedule('weekly-summary-sunday') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-summary-sunday'
);

-- Create weekly summary cron job
SELECT cron.schedule(
  'weekly-summary-sunday',          -- Job name
  '0 3 * * 0',                      -- Schedule: Sunday at 3 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/weekly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- ============================================
-- Monthly Summary Cron Job
-- Runs on 2nd of each month at 3 AM UTC
-- ============================================

-- Remove existing job if it exists
SELECT cron.unschedule('monthly-summary-2nd') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monthly-summary-2nd'
);

-- Create monthly summary cron job
SELECT cron.schedule(
  'monthly-summary-2nd',            -- Job name
  '0 3 2 * *',                      -- Schedule: 2nd of month at 3 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/monthly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- ============================================
-- Verify Cron Jobs Were Created
-- ============================================

SELECT 
  jobid,
  jobname,
  schedule,
  active,
  CASE 
    WHEN active THEN '✅ Active'
    ELSE '❌ Inactive'
  END as status
FROM cron.job 
WHERE jobname IN (
  'daily-summary-hourly', 
  'weekly-summary-sunday', 
  'monthly-summary-2nd'
)
ORDER BY jobname;

-- ============================================
-- To Check All Cron Jobs:
-- SELECT * FROM cron.job ORDER BY jobname;
-- 
-- To Disable a Job:
-- SELECT cron.unschedule('job-name');
-- 
-- To Re-enable a Job:
-- UPDATE cron.job SET active = true WHERE jobname = 'job-name';
-- ============================================

