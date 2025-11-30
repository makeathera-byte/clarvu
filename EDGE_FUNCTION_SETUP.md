# 🚀 Edge Function Setup for AI Summary Generation

## Problem
AI summaries are not generating at your set time because the Edge Function needs to run **hourly** to check each user's individual `ai_summary_time` setting.

## Solution: Set Up Hourly Cron Schedule

### Step 1: Open Supabase Dashboard

Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/functions

### Step 2: Find the `daily-summary` Function

Click on `daily-summary` in the functions list.

### Step 3: Set Up Cron Schedule

1. Click on **"Triggers"** or **"Cron Jobs"** tab
2. Add a new cron trigger:
   - **Schedule**: `0 * * * *` (runs every hour at minute 0)
   - **Function**: `daily-summary`
   - **Enabled**: ✅ Yes

Alternatively, you can use:
- `*/30 * * * *` - Runs every 30 minutes (more responsive)
- `0 0 * * *` - Runs once daily at midnight (won't work for custom times)

### Step 4: Verify the Function Code

Make sure your Edge Function has the updated code that:
1. Checks each user's `ai_summary_time` setting
2. Only generates summaries when current time >= user's set time
3. Skips if summary already generated today

### Step 5: Test the Function

You can manually trigger the function from the Supabase dashboard to test:
1. Click on `daily-summary` function
2. Click **"Invoke"** or **"Test"**
3. Check the logs to see if it processes users correctly

## How It Works

1. **Edge Function runs hourly** (at minute 0 of each hour)
2. **For each user**:
   - Fetches their `ai_summary_time` from `user_settings`
   - Checks if current time >= their set time
   - If yes AND no summary exists for today → generate summary
3. **Summary is saved** to `daily_summaries` table
4. **Frontend checks** every 5 minutes for new summaries and shows notification

## Troubleshooting

### Summaries Still Not Generating?

1. **Check cron schedule**: Make sure it's set to run hourly (`0 * * * *`)
2. **Check function logs**: Go to Functions → daily-summary → Logs
3. **Verify user settings**: Make sure `ai_summary_time` is saved in `user_settings`
4. **Check timezone**: Edge Function uses UTC time, make sure your time is set correctly

### Test Your Time Setting

To test if your time is correct:
1. Set `ai_summary_time` to a time very soon (e.g., 5 minutes from now)
2. Wait for the next hourly run (or trigger manually)
3. Check if summary was generated

### Manual Trigger (For Testing)

You can manually trigger the function:

```bash
curl -X POST https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Or use the Supabase Dashboard → Functions → daily-summary → Invoke

---

**Once the cron schedule is set up, summaries will generate automatically at each user's specified time!** ✅

