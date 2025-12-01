# 🔧 Fix: Supabase Connection Error (ENOTFOUND)

## Error Message
```
Error: getaddrinfo ENOTFOUND yklexlqvofsxiajmewhy.supabase.co
```

This means your app cannot connect to your Supabase project.

## Possible Causes

1. **Wrong Supabase URL** - The URL in your environment variables is incorrect
2. **Project Deleted/Paused** - Your Supabase project might have been deleted or paused
3. **Network Issue** - Your internet connection or DNS is having issues
4. **Environment Variable Not Set** - The `NEXT_PUBLIC_SUPABASE_URL` is missing or incorrect

## Quick Fixes

### Step 1: Verify Your Supabase Project

1. Go to: https://supabase.com/dashboard
2. Check if your project `yklexlqvofsxiajmewhy` exists
3. If it doesn't exist, you need to:
   - Create a new project, OR
   - Use a different project's URL

### Step 2: Get the Correct URL

1. Go to your Supabase project dashboard
2. Navigate to: **Settings** → **API**
3. Copy the **Project URL** (should look like: `https://xxxxx.supabase.co`)
4. Make sure it's the full URL with `https://`

### Step 3: Update Environment Variables

1. Check your `.env.local` file (or Vercel environment variables)
2. Make sure you have:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. **Important**: The URL should:
   - Start with `https://`
   - End with `.supabase.co`
   - Not have a trailing slash

### Step 4: Restart Your Dev Server

After updating environment variables:
```bash
# Stop your dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Verify It's Working

1. Check the terminal - you should NOT see `ENOTFOUND` errors
2. Try logging in to your app
3. Check browser console for any connection errors

## If Project Was Deleted

If your Supabase project was deleted:

1. **Create a new Supabase project:**
   - Go to: https://supabase.com/dashboard
   - Click "New Project"
   - Follow the setup wizard

2. **Update your environment variables** with the new project URL

3. **Re-run database migrations:**
   - Copy SQL from `supabase/complete_schema.sql`
   - Run it in the new project's SQL Editor

## Still Having Issues?

1. **Check your internet connection**
2. **Try accessing Supabase dashboard** - if you can't, it's a network issue
3. **Verify the URL format** - should be exactly: `https://xxxxx.supabase.co`
4. **Check for typos** in the project reference ID

## Common Mistakes

❌ Wrong: `yklexlqvofsxiajmewhy.supabase.co` (missing https://)
❌ Wrong: `https://yklexlqvofsxiajmewhy.supabase.co/` (trailing slash)
✅ Correct: `https://yklexlqvofsxiajmewhy.supabase.co`

