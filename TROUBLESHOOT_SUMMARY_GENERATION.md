# 🔍 Troubleshoot AI Summary Generation

## Quick Diagnosis

### Step 1: Check Your Settings

1. Go to Settings page
2. Verify your **AI Summary Time** is set (should show your selected time)
3. Note: Edge Function uses **UTC time**, so convert your local time

**Example:**
- If you want 10 PM local time
- And you're in UTC+5 timezone
- Set it to: `17:00` (10 PM - 5 hours = 5 PM UTC)

### Step 2: Check Cron Schedule

The Edge Function **must** run hourly for this to work.

**Check if cron is set up:**

Run this in Supabase SQL Editor:

```sql
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname LIKE '%daily-summary%';
```

**If no results:**
- Cron job is NOT set up
- See `COMPLETE_SETUP_GUIDE.md` to set it up

**If results but `active = false`:**
- Enable it:
```sql
UPDATE cron.job SET active = true WHERE jobname LIKE '%daily-summary%';
```

### Step 3: Test Your Configuration

I've created a test endpoint to help diagnose issues:

**Open browser console on dashboard page and run:**

```javascript
fetch('/api/test/summary-generation', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Summary Generation Status:', data));
```

This will show:
- Your `ai_summary_time` setting
- Current time vs target time
- Whether time has passed
- If you have logs for today
- If summary already exists
- Whether generation can happen

### Step 4: Check Function Logs

1. Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/functions
2. Click on `daily-summary`
3. Click on "Logs" tab
4. Look for recent executions
5. Check for errors

### Step 5: Manual Test (Bypass Time Check)

To test if the function works at all, you can manually trigger it:

**Option A: Using Test Endpoint**

```javascript
fetch('/api/test/trigger-summary', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Trigger Result:', data));
```

**Option B: Using Supabase Dashboard**

1. Go to Functions → daily-summary
2. Click "Invoke" or "Test"
3. Check logs for your user

## Common Issues

### Issue 1: "No logs for today"

**Problem:** Summary only generates if you have activity logs for today.

**Solution:** Log some activities today, then wait for the next hourly run.

### Issue 2: "Summary already exists"

**Problem:** Summary was already generated today.

**Solution:** Wait until tomorrow, or delete today's summary:

```sql
DELETE FROM daily_summaries 
WHERE user_id = 'YOUR_USER_ID' 
AND date = CURRENT_DATE;
```

### Issue 3: "Time hasn't passed yet"

**Problem:** Current time hasn't reached your set `ai_summary_time` yet.

**Solution:** 
- Wait until your set time passes
- Or set time to a few minutes from now for testing
- Remember: Edge Function uses UTC time

### Issue 4: "Cron not running"

**Problem:** Cron job isn't scheduled or isn't active.

**Solution:** Set up cron schedule (see `COMPLETE_SETUP_GUIDE.md`)

### Issue 5: "Timezone mismatch"

**Problem:** You set time in local time, but Edge Function uses UTC.

**Solution:** Convert your local time to UTC before setting.

**Example:**
- Local time: 10:00 PM (22:00)
- Timezone: UTC+5
- Set in settings: 17:00 (5:00 PM UTC)

## Quick Fix Checklist

- [ ] `ai_summary_time` is set in user_settings
- [ ] Cron job exists and is active
- [ ] You have logs for today
- [ ] Summary doesn't already exist for today
- [ ] Current time >= your set time (in UTC)
- [ ] Edge Function logs show no errors

## Testing Steps

1. **Set AI Summary Time to 5 minutes from now** (convert to UTC)
2. **Wait for next hour** (or trigger manually)
3. **Check if summary was generated**
4. **Check Daily tab** for new summary

## Get Help

If still not working:

1. Run the test endpoint: `/api/test/summary-generation`
2. Copy the output
3. Check Edge Function logs
4. Verify cron schedule is set up

---

**Most common issue: Cron schedule not set up!** ⚠️

Make sure the cron job is configured to run hourly.

