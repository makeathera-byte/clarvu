# Admin Setup - Quick Guide

## ✅ Step 1: Run SQL Migration

The SQL migration needs to be run manually in Supabase dashboard because Supabase doesn't provide a direct API for executing arbitrary SQL.

### Instructions:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste SQL**
   - Open the file: `supabase/migrations/create_analytics_tables.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for "Success" message

5. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - You should see three new tables:
     - `visits`
     - `signup_events`
     - `usage_events`

## ✅ Step 2: Create Admin User

The admin user creation script has been run automatically. If you need to run it again:

```bash
npx tsx scripts/make-admin.ts
```

**Admin Credentials:**
- Email: `makeathera@gmail.com`
- Password: `pp06082006pp`

## ✅ Step 3: Access Admin Panel

1. Start your dev server (if not running):
   ```bash
   npm run dev
   ```

2. Navigate to admin panel:
   ```
   http://localhost:3000/ppadminpp
   ```

3. Login with admin credentials

## 🎉 Done!

Your admin panel is now set up and ready to use!

