# 🔧 Fix: Create routine_summaries Table

## Quick Fix (2 minutes)

The `routine_summaries` table is missing from your database. Here's how to add it:

### Option 1: Run Just This Table (Recommended if you already have other tables)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new

2. **Copy and paste this SQL:**

```sql
-- Create routine_summaries table for caching AI-generated routines
CREATE TABLE IF NOT EXISTS routine_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  routine JSONB NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_routine_summaries_user_date ON routine_summaries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_routine_summaries_user_created ON routine_summaries(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE routine_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own routine summaries" ON routine_summaries;
CREATE POLICY "Users can view their own routine summaries"
  ON routine_summaries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own routine summaries" ON routine_summaries;
CREATE POLICY "Users can insert their own routine summaries"
  ON routine_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own routine summaries" ON routine_summaries;
CREATE POLICY "Users can update their own routine summaries"
  ON routine_summaries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_routine_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_routine_summaries_updated_at ON routine_summaries;
CREATE TRIGGER update_routine_summaries_updated_at
  BEFORE UPDATE ON routine_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_routine_summaries_updated_at();
```

3. **Click RUN** (or press `Ctrl+Enter`)

4. **Refresh your app** - The error should be gone!

---

### Option 2: Run Complete Schema (If you haven't set up tables yet)

If you haven't run the complete schema yet, you can run the entire `supabase/complete_schema.sql` file which now includes the `routine_summaries` table.

1. Open `supabase/complete_schema.sql`
2. Copy everything
3. Paste into Supabase SQL Editor
4. Click RUN

---

## Verify It Worked

After running the SQL, check your Supabase Table Editor:
https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/editor

You should see `routine_summaries` in the list of tables.

---

## What This Table Does

- Stores AI-generated daily routines for each user
- Caches routines so they persist across page refreshes
- One routine per user per day (enforced by UNIQUE constraint)
- Automatically updates `updated_at` timestamp when modified

---

## Still Having Issues?

If you still see errors:

1. Check the Supabase SQL Editor for any error messages
2. Make sure you copied the ENTIRE SQL block above
3. Verify you're logged into the correct Supabase project
4. Check browser console for specific error messages

