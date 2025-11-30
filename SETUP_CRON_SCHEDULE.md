# ⚡ Set Up Cron Schedule for AI Summary Generation

## Quick Setup Guide

The Edge Function `daily-summary` needs to run **hourly** to check each user's individual `ai_summary_time` setting and generate summaries at the right time.

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy

2. **Navigate to Database → Cron Jobs:**
   - Click on "Database" in the left sidebar
   - Click on "Cron Jobs" or search for "pg_cron"

3. **Create New Cron Job:**
   - Click "New Cron Job" or "Create Cron"
   - Fill in:
     - **Name**: `daily-summary-hourly`
     - **Schedule**: `0 * * * *` (runs every hour at minute 0)
     - **Command**: 
       ```sql
       SELECT net.http_post(
         url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary',
         headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb
       );
       ```
     - Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key
   - **Enabled**: ✅ Yes

4. **Save**

### Method 2: Using SQL Editor

1. **Open SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new

2. **Run This SQL:**

```sql
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job to run daily-summary function hourly
SELECT cron.schedule(
  'daily-summary-hourly',           -- Job name
  '0 * * * *',                       -- Schedule: every hour at minute 0
  $$SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    )
  )$$
);
```

**⚠️ IMPORTANT:** Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key from:
- Settings → API → Service Role Key (secret)

3. **Click RUN**

### Method 3: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Add cron job via migration
supabase migration new add_daily_summary_cron

# Then add the SQL from Method 2 to the migration file
# Finally:
supabase db push
```

## Verify It's Working

### Check Cron Job Status

Run this query in SQL Editor:

```sql
SELECT * FROM cron.job WHERE jobname = 'daily-summary-hourly';
```

You should see the job listed.

### Check Recent Runs

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-summary-hourly')
ORDER BY start_time DESC
LIMIT 10;
```

### Check Function Logs

1. Go to: Functions → daily-summary → Logs
2. Look for recent executions
3. Check for any errors

## Schedule Options

- `0 * * * *` - Every hour at minute 0 (recommended)
- `*/30 * * * *` - Every 30 minutes (more responsive)
- `0 0 * * *` - Once daily at midnight (won't work for custom times)

## Troubleshooting

### Cron Job Not Running?

1. **Check pg_cron extension:**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```
   If empty, enable it:
   ```sql
   CREATE EXTENSION pg_cron;
   ```

2. **Check job exists:**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'daily-summary-hourly';
   ```

3. **Check job is enabled:**
   ```sql
   UPDATE cron.job SET active = true WHERE jobname = 'daily-summary-hourly';
   ```

### Function Not Being Called?

1. Check the function URL is correct
2. Verify service role key is valid
3. Check function logs for errors
4. Test function manually first

### Summaries Still Not Generating?

1. Verify user has `ai_summary_time` set in `user_settings`
2. Check if summary already exists for today
3. Verify user has logs for today
4. Check function logs for specific errors

---

**Once the cron schedule is set up, summaries will generate automatically at each user's specified time!** ✅

