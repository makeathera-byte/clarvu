# ✅ Weekly & Monthly Summary Verification Checklist

## Database Tables Status

Run this SQL to verify tables exist:

```sql
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('daily_summaries', 'weekly_summaries', 'monthly_summaries')
ORDER BY table_name;
```

**Expected Result:**
- ✅ `daily_summaries` - Should have columns: id, user_id, date, summary, insights, focus_score, created_at, updated_at
- ✅ `weekly_summaries` - Should have columns: id, user_id, week_start, summary, insights, created_at, updated_at
- ✅ `monthly_summaries` - Should have columns: id, user_id, month, summary, insights, created_at, updated_at

## Edge Functions Status

### 1. Daily Summary Function
- **Location**: `supabase/functions/daily-summary/index.ts`
- **Schedule**: Runs hourly, checks user's `ai_summary_time`
- **Verification**: 
  - Go to Supabase Dashboard → Functions → daily-summary
  - Click "Invoke" to test manually
  - Check logs for successful execution

### 2. Weekly Summary Function
- **Location**: `supabase/functions/weekly-summary/index.ts`
- **Schedule**: Every Sunday at 3 AM UTC
- **Logic**: 
  - Generates summary for previous week (last Sunday to Saturday)
  - Checks if summary already exists before generating
  - Requires at least 1 daily summary from that week
- **Verification**:
  - Go to Supabase Dashboard → Functions → weekly-summary
  - Click "Invoke" to test manually
  - Check logs for successful execution

### 3. Monthly Summary Function
- **Location**: `supabase/functions/monthly-summary/index.ts`
- **Schedule**: 2nd of each month at 3 AM UTC
- **Logic**:
  - Generates summary for previous month
  - Checks if summary already exists before generating
  - Requires at least 1 weekly summary from that month
- **Verification**:
  - Go to Supabase Dashboard → Functions → monthly-summary
  - Click "Invoke" to test manually
  - Check logs for successful execution

## Cron Schedule Status

Run this SQL to check cron jobs:

```sql
SELECT jobid, jobname, schedule, active, nodename, nodeport
FROM cron.job 
WHERE jobname IN ('daily-summary-hourly', 'weekly-summary-sunday', 'monthly-summary-2nd')
ORDER BY jobname;
```

**Expected Result:**
- ✅ `daily-summary-hourly` - Schedule: `0 * * * *` (every hour)
- ✅ `weekly-summary-sunday` - Schedule: `0 3 * * 0` (Sunday 3 AM)
- ✅ `monthly-summary-2nd` - Schedule: `0 3 2 * *` (2nd of month 3 AM)

**If cron jobs don't exist**, run the SQL from `supabase/migrations/setup_all_summary_cron_jobs.sql`

## Notification System Status

### 1. Summary Check Client
- **Location**: `components/notifications/SummaryCheckClient.tsx`
- **Functionality**:
  - ✅ Checks for daily summaries
  - ✅ Checks for weekly summaries
  - ✅ Checks for monthly summaries
  - ✅ Polls every 5 minutes
  - ✅ Shows inline notification banner
  - ✅ Shows browser notification (if permission granted)

### 2. Notification API
- **Location**: `app/api/notifications/summary-ready/route.ts`
- **Functionality**:
  - ✅ Supports `?type=daily` query param
  - ✅ Supports `?type=weekly` query param
  - ✅ Supports `?type=monthly` query param
  - ✅ Checks if summary is "new" (created in last 2 hours)

### 3. Test Notifications

To test notification flow:

1. **Generate a summary manually:**
   ```
   Visit: http://localhost:3000/test/generate-summary
   ```

2. **Check notification appears:**
   - Should see inline banner on dashboard
   - Should see browser notification (if permission granted)
   - Should navigate to correct tab when clicked

3. **Verify notification doesn't repeat:**
   - Refresh page
   - Notification should not appear again (localStorage prevents duplicates)

## End-to-End Test Flow

### Daily Summary Test:
1. ✅ Set your `ai_summary_time` in Settings (e.g., 10:30 PM)
2. ✅ Wait for that time (or trigger manually via Edge Function)
3. ✅ Check `daily_summaries` table - new row should appear
4. ✅ Wait up to 5 minutes - notification should appear
5. ✅ Click notification - should navigate to Daily tab

### Weekly Summary Test:
1. ✅ Ensure you have daily summaries for at least 7 days
2. ✅ Trigger `weekly-summary` Edge Function manually
3. ✅ Check `weekly_summaries` table - new row should appear
4. ✅ Wait up to 5 minutes - notification should appear
5. ✅ Click notification - should navigate to Weekly tab

### Monthly Summary Test:
1. ✅ Ensure you have weekly summaries for at least 4 weeks
2. ✅ Trigger `monthly-summary` Edge Function manually
3. ✅ Check `monthly_summaries` table - new row should appear
4. ✅ Wait up to 5 minutes - notification should appear
5. ✅ Click notification - should navigate to Monthly tab

## Troubleshooting

### Summaries not generating:
1. ✅ Check Edge Function logs in Supabase Dashboard
2. ✅ Verify GROQ_API_KEY is set in Edge Function secrets
3. ✅ Check cron jobs are active: `SELECT * FROM cron.job WHERE active = true;`
4. ✅ Verify user has activity logs or previous summaries

### Notifications not showing:
1. ✅ Check browser console for errors
2. ✅ Verify `SummaryCheckClient` is mounted on dashboard
3. ✅ Check `localStorage` - clear if testing repeatedly
4. ✅ Verify notification permission is granted in browser

### Wrong date ranges:
1. ✅ Daily: Should be for "today"
2. ✅ Weekly: Should be for "previous week" (last Sunday-Saturday)
3. ✅ Monthly: Should be for "previous month" (all weeks in that month)

## Files Modified/Created

- ✅ `supabase/functions/weekly-summary/index.ts` - Fixed date calculations
- ✅ `supabase/functions/monthly-summary/index.ts` - Fixed date calculations
- ✅ `components/notifications/SummaryCheckClient.tsx` - Added weekly/monthly support
- ✅ `app/api/notifications/summary-ready/route.ts` - Added type parameter support
- ✅ `COMPLETE_SUMMARY_SETUP.md` - Complete setup guide
- ✅ `supabase/migrations/setup_all_summary_cron_jobs.sql` - Cron setup SQL

---

**Everything should be working!** 🎉

If you encounter any issues, check the troubleshooting section above.

