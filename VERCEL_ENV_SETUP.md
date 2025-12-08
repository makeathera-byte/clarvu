# Vercel Environment Variables Setup

## Required Environment Variables

Your Vercel deployment needs the following environment variables to connect to Supabase:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://xrdxkgyynnzkbxtxoycl.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value (Legacy): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHhrZ3l5bm56a2J4dHhveWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzg3NzUsImV4cCI6MjA4MDYxNDc3NX0.m8WbUyDFel_SlyqlPcqlk7g35y2AoToCp3iHFxJhBvo`
   - Value (Modern Publishable Key): `sb_publishable_F-RIDynWW7EhVM_37YjFlQ_GKitoJqh`

## How to Add Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **Environment Variables**
4. Click **Add New**
5. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://xrdxkgyynnzkbxtxoycl.supabase.co`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**
6. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Use either the legacy anon key or the modern publishable key (both work)
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

## After Adding Variables

1. **Redeploy your application**:
   - Go to the **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Select **Redeploy**
   - Or push a new commit to trigger a redeploy

2. **Verify the deployment**:
   - Check the build logs to ensure no environment variable errors
   - Test the application to confirm Supabase connection works

## Troubleshooting

If you still see "error creating supabase client" after adding the variables:

1. **Verify variables are set correctly**:
   - Check for typos in variable names
   - Ensure values don't have extra spaces
   - Confirm all environments are selected

2. **Check build logs**:
   - Look for any error messages about missing environment variables
   - Verify the variables are being read during build

3. **Clear cache and redeploy**:
   - Sometimes Vercel caches environment variables
   - Try redeploying after a few minutes

## Note

- The `NEXT_PUBLIC_` prefix is required for these variables to be accessible in the browser
- These are safe to expose publicly (they're designed for client-side use)
- Never commit your `.env.local` file to git (it should be in `.gitignore`)

