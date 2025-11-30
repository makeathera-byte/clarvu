# Quick Database Setup Guide

Follow these steps to create all required database tables in Supabase:

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project (the one with URL: `yklexlqvofsxiajmewhy`)
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Run the Main Schema (First Migration)

Copy and paste this entire SQL script into the SQL Editor:

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Activity Logs Table
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

-- Daily Summaries Table
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  summary TEXT,
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Weekly Summaries Table
CREATE TABLE IF NOT EXISTS weekly_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  summary TEXT,
  insights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Monthly Summaries Table
CREATE TABLE IF NOT EXISTS monthly_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  summary TEXT,
  insights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_start_time ON activity_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON activity_logs(category);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_id ON daily_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(date);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_id ON weekly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_week_start ON weekly_summaries(week_start);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_id ON monthly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_month ON monthly_summaries(month);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activity_logs
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs"
  ON activity_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity logs"
  ON activity_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for daily_summaries
CREATE POLICY "Users can view their own daily summaries"
  ON daily_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily summaries"
  ON daily_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily summaries"
  ON daily_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily summaries"
  ON daily_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for weekly_summaries
CREATE POLICY "Users can view their own weekly summaries"
  ON weekly_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly summaries"
  ON weekly_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly summaries"
  ON weekly_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly summaries"
  ON weekly_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for monthly_summaries
CREATE POLICY "Users can view their own monthly summaries"
  ON monthly_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly summaries"
  ON monthly_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly summaries"
  ON monthly_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly summaries"
  ON monthly_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_activity_logs_updated_at
  BEFORE UPDATE ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_summaries_updated_at
  BEFORE UPDATE ON daily_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_summaries_updated_at
  BEFORE UPDATE ON weekly_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_summaries_updated_at
  BEFORE UPDATE ON monthly_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

5. Click **Run** (or press `Ctrl+Enter`)
6. You should see "Success. No rows returned" - that's normal!

## Step 3: Run the User Settings Schema (Second Migration)

Now create a **NEW QUERY** (click "New Query" again) and paste this:

```sql
-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  reminder_interval INTEGER DEFAULT 30 CHECK (reminder_interval IN (15, 30, 60)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();
```

7. Click **Run** again
8. You should see "Success. No rows returned"

## Step 4: Verify Tables Were Created

1. In Supabase Dashboard, click **Table Editor** in the left sidebar
2. You should now see these tables:
   - ✅ `activity_logs`
   - ✅ `daily_summaries`
   - ✅ `weekly_summaries`
   - ✅ `monthly_summaries`
   - ✅ `user_settings`

## Step 5: Refresh Your App

1. Go back to your DayFlow app
2. Refresh the page (F5 or Ctrl+R)
3. The yellow warning banner should disappear
4. You should now be able to log activities!

## Troubleshooting

### "relation already exists" error
- This is okay! It means the tables already exist. You can continue.

### "permission denied" error
- Make sure you're using the SQL Editor with full access
- Check that you're logged into the correct Supabase project

### Tables not showing up
- Wait a few seconds and refresh the Table Editor
- Check the SQL Editor for any error messages

### Still seeing errors in the app?
- Make sure you ran BOTH migrations
- Clear your browser cache and refresh
- Check the browser console for specific error messages

## Direct Links

- **SQL Editor**: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/editor

---

**That's it!** Once both SQL scripts are run successfully, your database will be ready and the app will work perfectly! 🎉

