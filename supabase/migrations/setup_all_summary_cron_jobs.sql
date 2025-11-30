-- Setup cron jobs for all summary types
-- This creates hourly/daily/weekly/monthly cron schedules

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Note: Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
-- You can find it in Supabase Dashboard -> Settings -> API -> Service Role Key

-- Daily Summary (hourly check for user-specific times)
-- Drop existing job if it exists
SELECT cron.unschedule('daily-summary-hourly') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-summary-hourly'
);

SELECT cron.schedule(
  'daily-summary-hourly',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer REPLACE_WITH_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )
  $$
) WHERE NOT EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-summary-hourly'
);

-- Weekly Summary (every Monday at 3 AM UTC to summarize previous completed week)
SELECT cron.unschedule('weekly-summary-monday') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-summary-monday'
);
SELECT cron.unschedule('weekly-summary-sunday') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-summary-sunday'
);

SELECT cron.schedule(
  'weekly-summary-monday',
  '0 3 * * 1',  -- Every Monday at 3 AM UTC (to summarize previous completed week)
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/weekly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer REPLACE_WITH_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )
  $$
) WHERE NOT EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-summary-monday'
);

-- Monthly Summary (2nd of each month at 3 AM UTC)
SELECT cron.unschedule('monthly-summary-2nd') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monthly-summary-2nd'
);

SELECT cron.schedule(
  'monthly-summary-2nd',
  '0 3 2 * *',  -- 2nd of each month at 3 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/monthly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer REPLACE_WITH_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )
  $$
) WHERE NOT EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monthly-summary-2nd'
);

-- Verify cron jobs were created
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname IN ('daily-summary-hourly', 'weekly-summary-monday', 'monthly-summary-2nd')
ORDER BY jobname;

