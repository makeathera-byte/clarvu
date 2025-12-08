# Vercel Environment Variables

## Required Environment Variables

Add these to your Vercel project:

### Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

---

## 🔐 Server-Side (Recommended - More Secure)

These variables are **NOT** exposed to the browser and should be used for server-side operations:

```
SUPABASE_URL=https://xrdxkgyynnzkbxtxoycl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHhrZ3l5bm56a2J4dHhveWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NzY0MDAsImV4cCI6MjA1MDQ1MjQwMH0.YourAnonKeyHere
```

**⚠️ IMPORTANT:** Replace `YourAnonKeyHere` with your actual Supabase anon key from your Supabase project settings.

---

## 🌐 Client-Side (Public - Required for Browser)

These variables **ARE** exposed to the browser and are required for client-side operations:

```
NEXT_PUBLIC_SUPABASE_URL=https://xrdxkgyynnzkbxtxoycl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHhrZ3l5bm56a2J4dHhveWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NzY0MDAsImV4cCI6MjA1MDQ1MjQwMH0.YourAnonKeyHere
```

**⚠️ IMPORTANT:** Replace `YourAnonKeyHere` with your actual Supabase anon key from your Supabase project settings.

---

## 🚀 Optional: App URL (For Redirects)

If you want to customize redirect URLs:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note:** If not set, the app will automatically detect the URL from the request.

---

## 📋 Setup Instructions

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click "Settings" → "Environment Variables"

2. **Add Each Variable**
   - Click "Add New"
   - Enter the variable name (e.g., `SUPABASE_URL`)
   - Enter the variable value
   - Select environments: **Production**, **Preview**, and **Development**
   - Click "Save"

3. **Repeat for All Variables**
   - Add `SUPABASE_URL`
   - Add `SUPABASE_ANON_KEY`
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (Optional) Add `NEXT_PUBLIC_APP_URL`

4. **Redeploy**
   - After adding all variables, trigger a new deployment
   - Or wait for the next automatic deployment

---

## 🔍 How to Get Your Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ Verification

After deployment, visit:
- `https://your-app.vercel.app/api/debug-supabase`

You should see:
```json
{
  "configured": true,
  "url": "https://xrdxkgyynnzkbxtxoycl...",
  "hasAnonKey": true,
  "usingPublicVars": false,
  "env": "production"
}
```

If `configured` is `false`, check that all environment variables are set correctly.

