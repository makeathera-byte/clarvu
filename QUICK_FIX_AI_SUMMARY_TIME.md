# ⚡ QUICK FIX: Add AI Summary Time Column

## Error
```
Could not find the 'ai_summary_time' column of 'user_settings' in the schema cache
```

## ✅ Quick Solution (30 seconds)

1. **Open Supabase SQL Editor:**
   - https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new

2. **Copy and paste this SQL:**

```sql
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_summary_time TIME DEFAULT '22:00';
```

3. **Click RUN** (or press `Ctrl+Enter`)

4. **Refresh your DayFlow app** - Error should be gone!

---

## What This Does

- Adds the `ai_summary_time` column to your `user_settings` table
- Sets default value to `22:00` (10:00 PM)
- The `IF NOT EXISTS` ensures it's safe to run multiple times

---

## Verify It Worked

Run this query to confirm:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_settings'
AND column_name = 'ai_summary_time';
```

You should see the column with default value `22:00:00`.

---

**That's it! Your app should work now.** 🎉

