# Database Verification Checklist

## Step 1: Verify Tables Exist in Supabase

1. Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/editor
2. Look for these tables in the left sidebar:
   - `activity_logs` ✅
   - `user_settings` ✅
   - `daily_summaries` ✅
   - `weekly_summaries` ✅
   - `monthly_summaries` ✅

**If you don't see these tables, you need to run the migrations!**

## Step 2: Quick Test Query

In Supabase SQL Editor, run this test query to verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('activity_logs', 'user_settings', 'daily_summaries', 'weekly_summaries', 'monthly_summaries');
```

**Expected Result:** You should see 5 rows returned (one for each table).

## Step 3: Check for Common Issues

### Issue: Tables don't exist
**Solution:** Run the migrations from `QUICK_DATABASE_SETUP.md`

### Issue: RLS policies blocking access
**Solution:** Make sure you ran the CREATE POLICY statements in the migrations

### Issue: Wrong Supabase project
**Solution:** Verify your `.env.local` file has the correct project URL

### Issue: Not logged in
**Solution:** Make sure you're authenticated in the app first

## Step 4: Manual Table Creation (If Needed)

If migrations failed, you can create tables manually:

### Create activity_logs table:

```sql
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activity logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activity logs" ON activity_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activity logs" ON activity_logs FOR DELETE USING (auth.uid() = user_id);
```

### Create user_settings table:

```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  reminder_interval INTEGER DEFAULT 30 CHECK (reminder_interval IN (15, 30, 60)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);
```

## Still Having Issues?

1. Check the browser console for the exact error message
2. Check Supabase logs: Dashboard → Logs → Postgres Logs
3. Verify your user is authenticated in the app
4. Make sure you ran ALL the SQL from both migration files

