-- DayFlow Complete Database Schema
-- Run this ENTIRE script in Supabase SQL Editor to create all tables at once
-- Copy everything below this line and paste into Supabase SQL Editor, then click RUN

-- ============================================================================
-- STEP 1: Enable UUID Extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 2: Create Activity Logs Table
-- ============================================================================
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
CREATE INDEX IF NOT EXISTS idx_activity_logs_start_time ON activity_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON activity_logs(category);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_logs;
CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own activity logs" ON activity_logs;
CREATE POLICY "Users can update their own activity logs"
  ON activity_logs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own activity logs" ON activity_logs;
CREATE POLICY "Users can delete their own activity logs"
  ON activity_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 3: Create User Settings Table (REQUIRED FOR APP TO WORK)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  reminder_interval INTEGER DEFAULT 30 CHECK (reminder_interval IN (15, 30, 60)),
  -- Notification settings (MARK 10)
  notifications_enabled BOOLEAN DEFAULT true,
  smart_reminders_enabled BOOLEAN DEFAULT true,
  min_reminder_interval_minutes INTEGER DEFAULT 15 CHECK (min_reminder_interval_minutes >= 5 AND min_reminder_interval_minutes <= 60),
  max_reminder_interval_minutes INTEGER DEFAULT 60 CHECK (max_reminder_interval_minutes >= 15 AND max_reminder_interval_minutes <= 120),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  reminder_mode TEXT DEFAULT 'medium' CHECK (reminder_mode IN ('low', 'medium', 'high')),
  -- AI Summary settings (MARK 11)
  ai_summary_time TIME DEFAULT '22:00',
  -- Theme preference
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Create Summary Tables (Optional - for future features)
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  summary TEXT,
  insights TEXT,
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

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

-- Create indexes for summary tables
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_id ON daily_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(date);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_id ON weekly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_week_start ON weekly_summaries(week_start);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_id ON monthly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_month ON monthly_summaries(month);

-- Enable RLS on summary tables
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_summaries
DROP POLICY IF EXISTS "Users can view their own daily summaries" ON daily_summaries;
CREATE POLICY "Users can view their own daily summaries"
  ON daily_summaries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own daily summaries" ON daily_summaries;
CREATE POLICY "Users can insert their own daily summaries"
  ON daily_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own daily summaries" ON daily_summaries;
CREATE POLICY "Users can update their own daily summaries"
  ON daily_summaries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own daily summaries" ON daily_summaries;
CREATE POLICY "Users can delete their own daily summaries"
  ON daily_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for weekly_summaries
DROP POLICY IF EXISTS "Users can view their own weekly summaries" ON weekly_summaries;
CREATE POLICY "Users can view their own weekly summaries"
  ON weekly_summaries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own weekly summaries" ON weekly_summaries;
CREATE POLICY "Users can insert their own weekly summaries"
  ON weekly_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own weekly summaries" ON weekly_summaries;
CREATE POLICY "Users can update their own weekly summaries"
  ON weekly_summaries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own weekly summaries" ON weekly_summaries;
CREATE POLICY "Users can delete their own weekly summaries"
  ON weekly_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for monthly_summaries
DROP POLICY IF EXISTS "Users can view their own monthly summaries" ON monthly_summaries;
CREATE POLICY "Users can view their own monthly summaries"
  ON monthly_summaries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own monthly summaries" ON monthly_summaries;
CREATE POLICY "Users can insert their own monthly summaries"
  ON monthly_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own monthly summaries" ON monthly_summaries;
CREATE POLICY "Users can update their own monthly summaries"
  ON monthly_summaries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own monthly summaries" ON monthly_summaries;
CREATE POLICY "Users can delete their own monthly summaries"
  ON monthly_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 5: Create Helper Functions and Triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_activity_logs_updated_at ON activity_logs;
CREATE TRIGGER update_activity_logs_updated_at
  BEFORE UPDATE ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

DROP TRIGGER IF EXISTS update_daily_summaries_updated_at ON daily_summaries;
CREATE TRIGGER update_daily_summaries_updated_at
  BEFORE UPDATE ON daily_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_summaries_updated_at ON weekly_summaries;
CREATE TRIGGER update_weekly_summaries_updated_at
  BEFORE UPDATE ON weekly_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_summaries_updated_at ON monthly_summaries;
CREATE TRIGGER update_monthly_summaries_updated_at
  BEFORE UPDATE ON monthly_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION: Check if tables were created successfully
-- ============================================================================
SELECT 
  '✅ Tables created successfully!' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('activity_logs', 'user_settings', 'daily_summaries', 'weekly_summaries', 'monthly_summaries');

