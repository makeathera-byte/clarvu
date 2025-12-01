# 🔧 Fix: routine_summaries Schema Cache Issue

If you've already created the table but still see the error, it's likely a **Supabase schema cache issue**.

## Quick Fixes (Try in order)

### Option 1: Wait and Refresh (30 seconds)
1. Wait 30 seconds after creating the table
2. Refresh your browser page (hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`)
3. Try generating a routine again

### Option 2: Verify Table Exists
Run this in Supabase SQL Editor to verify:

```sql
SELECT 
  table_name,
  '✅ Table exists!' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'routine_summaries';
```

If you see the table, it exists but Supabase needs to refresh its cache.

### Option 3: Recreate Table (Safe - won't delete data)
Run this to ensure everything is set up correctly:

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

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_routine_summaries_user_date ON routine_summaries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_routine_summaries_user_created ON routine_summaries(user_id, created_at DESC);

-- Ensure RLS is enabled
ALTER TABLE routine_summaries ENABLE ROW LEVEL SECURITY;

-- Recreate policies (safe - uses DROP IF EXISTS)
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

-- Recreate trigger function
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

### Option 4: Force Schema Refresh via Supabase Dashboard
1. Go to Supabase Dashboard → **Settings** → **API**
2. Scroll down and look for any "Refresh" or "Reload" buttons
3. Or try accessing the table directly: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/editor
4. Click on the `routine_summaries` table to view it
5. This sometimes forces a schema cache refresh

### Option 5: Check Table Permissions
Make sure the table is in the `public` schema:

```sql
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'routine_summaries';
```

Should show `schemaname = 'public'`

---

## Still Not Working?

If none of the above work, the issue might be:
1. **Wrong Supabase project** - Make sure you're running SQL in the same project as your app
2. **RLS blocking access** - Check if RLS policies are correct
3. **Connection issue** - Verify your `NEXT_PUBLIC_SUPABASE_URL` matches your project

---

## Test the Table Directly

Try inserting a test row to verify everything works:

```sql
-- This will fail if table doesn't exist or RLS is blocking
INSERT INTO routine_summaries (user_id, date, routine, explanation)
VALUES (
  auth.uid(),  -- Your user ID
  CURRENT_DATE,
  '{"morning": [], "afternoon": [], "evening": []}'::jsonb,
  'Test routine'
)
ON CONFLICT (user_id, date) DO NOTHING;
```

If this works, the table exists and the issue is just the schema cache.

