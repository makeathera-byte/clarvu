# ⚡ RUN THIS MIGRATION NOW

## Quick Fix - Add AI Summary Time Column

The error you're seeing means the database column doesn't exist yet. Run this SQL **RIGHT NOW**:

### Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new

### Step 2: Copy This SQL

```sql
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_summary_time TIME DEFAULT '22:00';
```

### Step 3: Run It

1. Paste the SQL into the editor
2. Click **RUN** button (or press `Ctrl+Enter`)
3. You should see: "Success. No rows returned"

### Step 4: Refresh Your App

Refresh your DayFlow dashboard page - the error should be gone!

---

## Full Migration (All Notification Columns)

If you want ALL the notification settings columns, run this instead:

```sql
-- Add AI summary time
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_summary_time TIME DEFAULT '22:00';

-- Add notification columns (if not already added)
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS smart_reminders_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS min_reminder_interval_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS max_reminder_interval_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME,
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME,
ADD COLUMN IF NOT EXISTS reminder_mode TEXT DEFAULT 'medium';
```

---

## Verify It Worked

After running, verify with this query:

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

---

**That's it! Just run the SQL and refresh. The error will disappear.** ✅

