# ⚡ Quick Fix: routine_summaries Table

## If Table Already Exists But Still Getting Error

This is usually a **Supabase schema cache issue**. The table exists but Supabase hasn't refreshed its cache yet.

### Solution 1: Wait and Retry (30-60 seconds)
1. Wait 30-60 seconds after creating the table
2. Hard refresh your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Try generating a routine again

### Solution 2: Re-run the Table Creation SQL
Even if the table exists, re-running the SQL can force a cache refresh:

1. Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new
2. Copy and paste this (safe to run multiple times):

```sql
-- This is safe - won't delete existing data
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

CREATE INDEX IF NOT EXISTS idx_routine_summaries_user_date ON routine_summaries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_routine_summaries_user_created ON routine_summaries(user_id, created_at DESC);

ALTER TABLE routine_summaries ENABLE ROW LEVEL SECURITY;

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

3. Click **RUN**
4. Wait 30 seconds
5. Refresh your app

### Solution 3: Verify Table in Dashboard
1. Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/editor
2. Look for `routine_summaries` in the table list
3. Click on it to view the table
4. This sometimes forces a schema refresh

### Solution 4: Test Direct Insert
Try inserting a test row to verify the table works:

```sql
INSERT INTO routine_summaries (user_id, date, routine, explanation)
VALUES (
  auth.uid(),
  CURRENT_DATE,
  '{"morning": [], "afternoon": [], "evening": []}'::jsonb,
  'Test'
)
ON CONFLICT (user_id, date) DO NOTHING;
```

If this works, the table exists and it's just a cache issue.

---

## What I Fixed in the Code

I've added:
- ✅ Automatic retry logic (waits 2 seconds and retries if schema cache error)
- ✅ Better error handling (continues even if cache check fails)
- ✅ More helpful error messages

The app will now:
- Try to use the table if it exists
- Retry once if there's a schema cache error
- Continue generating routines even if cache check fails
- Save routines when possible, but won't block if save fails

---

## Still Not Working?

If you've tried all the above and it's still not working:

1. **Check your Supabase project URL** - Make sure `NEXT_PUBLIC_SUPABASE_URL` matches your project
2. **Check RLS policies** - Make sure you're logged in and policies allow access
3. **Check browser console** - Look for specific error messages
4. **Try in incognito mode** - Sometimes browser cache can cause issues

