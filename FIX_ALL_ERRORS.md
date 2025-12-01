# Fix All Admin Panel Errors

## Current Issues

1. **404 Errors** - Tables don't exist: `visits`, `signup_events`, `usage_events`
2. **Schema Cache Errors** - "Could not find the table in the schema cache"
3. **Admin Panel Not Showing Data** - Because tables don't exist

## Root Cause

The analytics tables (`visits`, `signup_events`, `usage_events`) have NOT been created in your Supabase database yet.

## Solution: Run SQL Migration

### Step 1: Get the SQL

Run this command to see the SQL:
```bash
npx tsx scripts/show-sql-migration.ts
```

### Step 2: Run in Supabase

1. Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new
2. Sign in if needed
3. Paste the SQL from Step 1
4. Click "Run" (or press Ctrl+Enter)
5. Wait for "Success" message

### Step 3: Verify Tables

After running the SQL, verify tables exist:
```bash
npx tsx scripts/verify-tables.ts
```

You should see:
- ✅ 'visits' table exists and is accessible
- ✅ 'signup_events' table exists and is accessible  
- ✅ 'usage_events' table exists and is accessible

### Step 4: Test Admin Panel

1. Restart dev server
2. Go to `/ppadminpp`
3. Data should now appear

## Quick SQL (Copy This)

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

## After Migration

Once tables are created:
- ✅ 404 errors will stop
- ✅ Admin panel will show data
- ✅ Signups will be logged
- ✅ Visits will be logged
- ✅ Usage events will be logged

## Note

The tables will be empty initially. Data will populate as:
- Users sign up → `signup_events`
- Users visit pages → `visits`
- Users perform actions → `usage_events`

