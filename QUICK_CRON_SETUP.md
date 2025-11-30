# ⚡ Quick Cron Setup - 3 Steps!

## ✅ Step 1: Extensions Already Enabled!

The `pg_cron` and `http` extensions have been enabled automatically.

## 🔑 Step 2: Get Your Service Role Key

1. Go to: **https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/settings/api**
2. Scroll to **"Project API keys"** section
3. Find **"Service Role Key"** (it's secret - click the 👁️ icon to reveal)
4. **Copy the entire key** (it's a very long JWT token starting with `eyJ...`)

## 📝 Step 3: Run the Setup SQL

1. Open SQL Editor: **https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new**
2. Open the file: **`scripts/setup-cron-jobs.sql`**
3. Press **Ctrl+H** (or Cmd+H on Mac) to find and replace
4. Find: `YOUR_SERVICE_ROLE_KEY`
5. Replace with: Your actual service role key (paste it)
6. Click **"Replace All"** (should replace 3 occurrences)
7. Click **"RUN"** button

**That's it!** 🎉

## ✅ Verify It Worked

After running, you should see a table showing 3 cron jobs:

```
 jobid |        jobname         |  schedule  | active
-------+------------------------+------------+--------
   123 | daily-summary-hourly   | 0 * * * *  |   t
   124 | weekly-summary-sunday  | 0 3 * * 0  |   t
   125 | monthly-summary-2nd    | 0 3 2 * *  |   t
```

## 🚨 Troubleshooting

**"relation cron.job does not exist"**
- The pg_cron extension might need to be enabled manually
- Go to: Database → Extensions → Search "pg_cron" → Enable

**"permission denied"**
- Make sure you're logged in as the project owner
- Try running from the Supabase Dashboard SQL Editor (not a migration)

**Cron jobs not appearing**
- Check the SQL executed successfully
- Verify extensions are enabled:
  ```sql
  SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'http');
  ```

---

**Once set up, your summaries will generate automatically:**
- ⏰ **Daily**: Every hour (checks your `ai_summary_time` setting)
- 📅 **Weekly**: Every Sunday at 3 AM UTC
- 📆 **Monthly**: 2nd of each month at 3 AM UTC

Users will get notifications when summaries are ready! 🎉

