-- Setup cron job for daily-summary Edge Function to run hourly
-- This checks each user's ai_summary_time and generates summaries accordingly

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing job if it exists
SELECT cron.unschedule('daily-summary-hourly') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-summary-hourly'
);

-- Create cron job to run daily-summary function hourly
-- Note: Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
-- You can find it in Supabase Dashboard -> Settings -> API -> Service Role Key

-- IMPORTANT: Update the SERVICE_ROLE_KEY placeholder before running this migration
SELECT cron.schedule(
  'daily-summary-hourly',           -- Job name
  '0 * * * *',                       -- Schedule: every hour at minute 0 (UTC)
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

-- Verify the cron job was created
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'daily-summary-hourly';

