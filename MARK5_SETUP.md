# MARK 5 Setup Guide: AI Engine with Groq Integration

This guide walks you through setting up the AI-powered summary system using Groq API and Supabase Edge Functions.

## Overview

MARK 5 adds:
- **AI-powered daily summaries** (generated nightly at 2 AM)
- **Weekly summaries** (generated Sundays at 3 AM)
- **Monthly summaries** (generated on 2nd of each month at 3 AM)
- **Focus score calculation** (deterministic + AI-enhanced)
- **Productivity insights** via Groq AI (Llama3/Mixtral models)

## Prerequisites

1. **Groq API Key** - Sign up at [console.groq.com](https://console.groq.com) (free tier available)
2. **Supabase Project** - Already configured
3. **Supabase CLI** - For deploying Edge Functions

## Part 1: Install Supabase CLI

```bash
npm install -g supabase
```

Or use your preferred package manager:
```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## Part 2: Environment Variables

### Local Development (.env.local)

Add these to your existing `.env.local` file:

```env
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=https://yklexlqvofsxiajmewhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# NEW: Groq API Key
GROQ_API_KEY=your_groq_api_key_here

# NEW: Supabase Service Role Key (for Edge Functions only)
# Get this from: Supabase Dashboard → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**To get your Groq API Key:**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy it to your `.env.local`

**To get your Supabase Service Role Key:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Find **service_role** key (keep this secret!)
5. Copy it to your `.env.local` (for local testing only)

### Vercel Environment Variables

Add these in your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `GROQ_API_KEY` - Your Groq API key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for Edge Functions)

**Note:** Edge Functions run on Supabase, not Vercel, so `GROQ_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are configured in Supabase Dashboard (see Part 3).

## Part 3: Configure Supabase Edge Functions Environment

Edge Functions need their own environment variables configured in Supabase:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Edge Functions** → **Settings**
4. Add these secrets:
   - `GROQ_API_KEY` = `your_groq_api_key_here`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your_service_role_key_here`

Or use the Supabase CLI:

```bash
# Link to your project
supabase link --project-ref yklexlqvofsxiajmewhy

# Set secrets
supabase secrets set GROQ_API_KEY=your_groq_api_key_here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Part 4: Deploy Edge Functions

### Option 1: Using Supabase CLI (Recommended)

```bash
# Link your project
supabase link --project-ref yklexlqvofsxiajmewhy

# Deploy all functions
supabase functions deploy daily-summary
supabase functions deploy weekly-summary
supabase functions deploy monthly-summary
```

### Option 2: Using Supabase Dashboard

1. Go to **Edge Functions** in your Supabase Dashboard
2. Click **Create a new function**
3. For each function (`daily-summary`, `weekly-summary`, `monthly-summary`):
   - Copy the contents from `supabase/functions/[function-name]/index.ts`
   - Paste into the editor
   - Click **Deploy**

## Part 5: Set Up Cron Jobs

Edge Functions need to be scheduled to run automatically. Use Supabase Cron or an external service like Vercel Cron.

### Using Supabase Cron (pg_cron extension)

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily summary (runs every day at 2 AM UTC)
SELECT cron.schedule(
  'daily-summary',
  '0 2 * * *',  -- Every day at 2 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);

-- Schedule weekly summary (runs every Sunday at 3 AM UTC)
SELECT cron.schedule(
  'weekly-summary',
  '0 3 * * 0',  -- Every Sunday at 3 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/weekly-summary',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);

-- Schedule monthly summary (runs on 2nd of each month at 3 AM UTC)
SELECT cron.schedule(
  'monthly-summary',
  '0 3 2 * *',  -- 2nd of each month at 3 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/monthly-summary',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

**Note:** Replace `YOUR_ANON_KEY` with your actual Supabase anon key, or use the service role key if you prefer.

### Alternative: Manual Testing

You can manually trigger Edge Functions for testing:

```bash
# Using curl
curl -X POST \
  'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'

# Using Supabase CLI
supabase functions invoke daily-summary
supabase functions invoke weekly-summary
supabase functions invoke monthly-summary
```

## Part 6: Verify Setup

1. **Check Edge Functions are deployed:**
   - Go to Supabase Dashboard → Edge Functions
   - You should see `daily-summary`, `weekly-summary`, `monthly-summary`

2. **Test manually:**
   - Trigger the daily-summary function manually
   - Check your `daily_summaries` table for new entries

3. **Check Dashboard:**
   - Log some activities
   - Wait for nightly summary (or trigger manually)
   - Check `/dashboard` - AI Summary section should show data

## Part 7: Database Schema Updates

MARK 5 uses existing tables (`daily_summaries`, `weekly_summaries`, `monthly_summaries`). Ensure these are created:

Run `supabase/complete_schema.sql` in your Supabase SQL Editor if you haven't already.

## Troubleshooting

### Edge Functions Not Deploying

- Check that you're linked to the correct project: `supabase link --project-ref your-project-ref`
- Verify secrets are set: `supabase secrets list`
- Check function logs in Supabase Dashboard → Edge Functions → Logs

### "GROQ_API_KEY not configured" Error

- Ensure secrets are set in Supabase Dashboard → Edge Functions → Settings
- Or use CLI: `supabase secrets set GROQ_API_KEY=your_key`

### No Summaries Generated

- Check Edge Function logs for errors
- Verify users have activity logs in the `activity_logs` table
- Ensure cron jobs are scheduled correctly
- Test functions manually first

### Focus Score is 0

- This is normal if no work activities are logged
- Check that categories include "Work" or "Deep Work" for focus calculation

## Cost Considerations

- **Groq API:** Free tier includes generous limits (check [groq.com/pricing](https://groq.com/pricing))
- **Supabase Edge Functions:** Free tier includes 500K invocations/month
- **Database:** Standard Supabase free tier limits apply

## Next Steps

After setup is complete:
1. Log activities throughout the day
2. Wait for nightly summary generation (or trigger manually)
3. View AI insights on the Dashboard
4. Check weekly/monthly summaries for long-term patterns

## Support

For issues or questions:
- Check Supabase Edge Functions logs
- Review Groq API documentation
- Verify all environment variables are set correctly

