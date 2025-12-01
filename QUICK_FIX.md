# 🚨 QUICK FIX - Run This SQL Now

## The Problem
All 404 errors are because the analytics tables don't exist in your database.

## The Solution
Run this SQL in Supabase SQL Editor:

---

## 📋 COPY THIS SQL:

```sql
-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT NOT NULL,
  device TEXT NOT NULL DEFAULT 'unknown',
  country TEXT NOT NULL DEFAULT 'unknown',
  visited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create signup_events table
CREATE TABLE IF NOT EXISTS signup_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  signed_up_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create usage_events table
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event TEXT NOT NULL,
  value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_visits_path ON visits(path);
CREATE INDEX IF NOT EXISTS idx_signup_events_user_id ON signup_events(user_id);
CREATE INDEX IF NOT EXISTS idx_signup_events_signed_up_at ON signup_events(signed_up_at);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_event ON usage_events(event);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_events_value ON usage_events(value) WHERE value IS NOT NULL;

-- Enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own visits"
  ON visits FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own signup"
  ON signup_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage events"
  ON usage_events FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🎯 STEPS:

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new
   - (Sign in if needed)

2. **Paste the SQL above** into the editor

3. **Click "Run"** (or press Ctrl+Enter)

4. **Wait for "Success"** message

5. **Refresh admin panel** at `/ppadminpp`

---

## ✅ After Running:

- ✅ All 404 errors will stop
- ✅ Admin panel will show data
- ✅ Signups will be logged automatically
- ✅ Visits will be logged automatically
- ✅ Usage events will be logged automatically

---

## 🔍 Verify It Worked:

Run this to check:
```bash
npx tsx scripts/verify-tables.ts
```

You should see all ✅ green checkmarks.

