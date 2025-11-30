# Add AI Summary Time Column - Quick Fix

## Error
```
Could not find the 'ai_summary_time' column of 'user_settings' in the schema cache
```

## Solution: Run the Migration

You need to add the `ai_summary_time` column to your `user_settings` table.

### Option 1: Run Migration SQL Directly (Quickest)

1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new)

2. Copy and paste this SQL:

```sql
-- Add ai_summary_time column to user_settings table
-- Default: 22:00 (10 PM)

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_summary_time TIME DEFAULT '22:00';

-- Add comment
COMMENT ON COLUMN user_settings.ai_summary_time IS 'Time of day when daily AI summary should be generated (default: 22:00)';
```

3. Click **RUN** or press `Ctrl+Enter`

4. You should see: `Success. No rows returned`

5. Refresh your DayFlow app - the error should be gone!

### Option 2: Run from Migration File

If you have Supabase CLI set up:

```bash
supabase db push
```

Or manually:

1. Open the file: `supabase/migrations/add_ai_summary_time.sql`
2. Copy the contents
3. Paste into Supabase SQL Editor
4. Run it

### Verify It Worked

After running the migration, you can verify by running this query:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_settings'
AND column_name = 'ai_summary_time';
```

You should see:
- `column_name`: ai_summary_time
- `data_type`: time without time zone
- `column_default`: 22:00:00

## What This Does

- Adds a new column `ai_summary_time` to the `user_settings` table
- Default value is `22:00` (10:00 PM)
- Allows users to customize when their daily AI summary is generated

---

**Once you run this, the error will be resolved and AI summary time settings will work!**

