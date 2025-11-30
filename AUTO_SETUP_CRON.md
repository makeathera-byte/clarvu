# 🚀 Auto-Setup Cron Jobs for Summary Generation

I'll help you set up the cron jobs automatically! Follow these steps:

## Option 1: Quick Setup via Supabase Dashboard (Recommended)

### Step 1: Enable Extensions
1. Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/database/extensions
2. Search for and enable:
   - ✅ `pg_cron`
   - ✅ `http` (for making HTTP requests)

### Step 2: Get Your Service Role Key
1. Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/settings/api
2. Find **"Service Role Key"** (under "Project API keys")
3. Click the 👁️ icon to reveal it
4. **Copy the entire key** (it's long!)

### Step 3: Run the Setup SQL
1. Open SQL Editor: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new
2. Open the file: `scripts/setup-cron-jobs.sql`
3. **Replace all 3 occurrences of `YOUR_SERVICE_ROLE_KEY`** with your actual service role key
4. Click **"RUN"**

That's it! The cron jobs are now set up! ✅

## Option 2: Manual Setup (If you prefer more control)

### Check Current Status
Run this in SQL Editor to see what's already configured:

```sql
-- Check if extensions are enabled
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('pg_cron', 'http');

-- Check existing cron jobs
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname LIKE '%summary%'
ORDER BY jobname;
```

### Enable Extensions (if not already enabled)
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;
```

### Setup Individual Cron Jobs

**Daily Summary (Hourly):**
```sql
SELECT cron.schedule(
  'daily-summary-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Weekly Summary (Sunday 3 AM UTC):**
```sql
SELECT cron.schedule(
  'weekly-summary-sunday',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/weekly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Monthly Summary (2nd of month, 3 AM UTC):**
```sql
SELECT cron.schedule(
  'monthly-summary-2nd',
  '0 3 2 * *',
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/monthly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## Verify Setup

After running the setup, verify everything is working:

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  nodename
FROM cron.job 
WHERE jobname IN (
  'daily-summary-hourly', 
  'weekly-summary-sunday', 
  'monthly-summary-2nd'
)
ORDER BY jobname;
```

**Expected Output:**
```
 jobid |        jobname         |  schedule  | active | nodename
-------+------------------------+------------+--------+----------
   123 | daily-summary-hourly   | 0 * * * *  |   t    | localhost
   124 | weekly-summary-sunday  | 0 3 * * 0  |   t    | localhost
   125 | monthly-summary-2nd    | 0 3 2 * *  |   t    | localhost
```

## Troubleshooting

### Cron jobs not running?
1. Check if extensions are enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'http');
   ```
2. Check if jobs are active:
   ```sql
   SELECT jobname, active FROM cron.job WHERE jobname LIKE '%summary%';
   ```
3. Check cron job logs (if available in your Supabase plan)

### Service Role Key Issues?
- Make sure you copied the **entire** key (it's very long!)
- Don't include quotes around the key
- The key should start with `eyJ...`

### Need to Remove/Update a Cron Job?
```sql
-- Remove a job
SELECT cron.unschedule('daily-summary-hourly');

-- Disable a job (keeps it but stops running)
UPDATE cron.job SET active = false WHERE jobname = 'daily-summary-hourly';

-- Re-enable a job
UPDATE cron.job SET active = true WHERE jobname = 'daily-summary-hourly';
```

## What Happens Next?

Once cron jobs are set up:

1. **Daily Summaries**: Generated hourly, checking each user's `ai_summary_time` setting
2. **Weekly Summaries**: Generated every Sunday at 3 AM UTC (based on previous week's daily summaries)
3. **Monthly Summaries**: Generated on 2nd of each month at 3 AM UTC (based on previous month's weekly summaries)

Users will receive notifications on the dashboard when summaries are ready! 🎉

---

**Need help?** Check the logs in Supabase Dashboard → Functions → [function-name] → Logs

