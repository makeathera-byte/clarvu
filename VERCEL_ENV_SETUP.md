# Vercel Environment Variables Setup

## Required Environment Variables

For AI features to work in production, you **must** add these environment variables in your Vercel project settings:

### 1. Go to Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **DayFlow** project
3. Go to **Settings** → **Environment Variables**

### 2. Add Required Variables

Add these environment variables:

#### **GROQ_API_KEY** (Required for AI features)
- **Value**: Your Groq API key (starts with `gsk_`)
- **Environments**: Production, Preview, Development
- **How to get it**: 
  1. Visit [console.groq.com](https://console.groq.com/)
  2. Sign up or log in
  3. Go to **API Keys** section
  4. Click **Create API Key**
  5. Copy the key

#### **SUPABASE_SERVICE_ROLE_KEY** (Required for AI features)
- **Value**: Your Supabase service role key
- **Environments**: Production, Preview, Development
- **How to get it**:
  1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
  2. Select your project
  3. Go to **Settings** → **API**
  4. Copy the **service_role** key (⚠️ Keep this secret!)

#### **NEXT_PUBLIC_SUPABASE_URL** (Already configured)
- Should already be set from your Supabase setup

#### **NEXT_PUBLIC_SUPABASE_ANON_KEY** (Already configured)
- Should already be set from your Supabase setup

### 3. Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## Verification

After deployment, test AI features:

1. **Test AI API**: Visit `https://your-domain.vercel.app/api/test-ai`
   - Should return success if `GROQ_API_KEY` is configured

2. **Test Routine Generation**: 
   - Go to Dashboard → Routine tab
   - Click "Regenerate" button
   - Should generate AI-enhanced routine

## Troubleshooting

### AI Features Not Working

1. **Check Environment Variables**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `GROQ_API_KEY` is set for Production environment
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set

2. **Check Deployment Logs**:
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check **Build Logs** and **Function Logs** for errors

3. **Test API Endpoint**:
   - Visit `/api/test-ai` to see detailed error messages
   - Check browser console for client-side errors

4. **Common Issues**:
   - ❌ "GROQ_API_KEY not configured" → Add the key in Vercel
   - ❌ "AI routine generation failed" → Check Vercel function logs
   - ❌ Rate limit errors → Wait a few minutes and try again

### Missing Environment Variables

If environment variables are missing:
- The app will still work, but AI features will be disabled
- Routine generation will use baseline (non-AI) patterns
- You'll see warnings in server logs

## Security Notes

- ⚠️ **Never commit** `.env.local` files to Git
- ✅ Environment variables in Vercel are encrypted
- ✅ Service role key should only be used server-side (already configured correctly)
- ✅ API keys are not exposed to the frontend

