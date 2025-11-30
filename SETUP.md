# DayFlow Setup Guide

## Quick Start

### 1. Create Environment Variables File

**IMPORTANT:** You must create a `.env.local` file in the root directory (`D:\DayFlow\web\.env.local`) with your Supabase credentials.

Create a file named `.env.local` (not `.env.example`) with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yklexlqvofsxiajmewhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGV4bHF2b2ZzeGlham1ld2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjg4NTQsImV4cCI6MjA3OTkwNDg1NH0.xK4LjiXnpu2hooZvAfT560edCWfP6LxlgLTJO9z_giM
```

### 2. Restart Your Development Server

After creating `.env.local`, you **must** restart your development server:

1. Stop the current server (Ctrl+C)
2. Run `npm run dev` again

Environment variables are only loaded when the server starts!

### 3. Verify Setup

- The app should start without errors
- You should be able to access the login page
- No console errors about missing Supabase credentials

## Troubleshooting

### Error: "Your project's URL and Key are required"

This means the `.env.local` file is missing or the environment variables aren't loaded.

**Solution:**
1. Check that `.env.local` exists in the root directory (`D:\DayFlow\web\.env.local`)
2. Verify the file contains both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Restart your development server completely
4. Make sure there are no typos in the variable names

### Environment Variables Not Loading

- Ensure the file is named exactly `.env.local` (not `.env`, not `.env.example`)
- The file must be in the root directory (same level as `package.json`)
- Restart the dev server after creating/editing the file

## Database Setup

After setting up environment variables, run the database migrations:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to SQL Editor
4. Run `supabase/schema.sql` first
5. Then run `supabase/user_settings.sql`

Your app should now be fully functional!

