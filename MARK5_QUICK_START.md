# MARK 5 Quick Start Guide

## 🎯 What's New in MARK 5?

- ✨ **AI-Powered Daily Summaries** - Generated nightly using Groq AI
- 📊 **Focus Scores** - Calculated from your activity patterns (0-100)
- 📈 **Weekly & Monthly Insights** - Long-term productivity analysis
- 🤖 **Automated Processing** - Runs in background, no user interaction needed

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Groq API Key (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free tier available)
3. Navigate to **API Keys**
4. Create a new key
5. Copy the key

### Step 2: Add to Environment Variables

Add to your `.env.local` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Step 3: Deploy Edge Functions

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref yklexlqvofsxiajmewhy

# Set secrets
supabase secrets set GROQ_API_KEY=your_groq_api_key_here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Deploy functions
supabase functions deploy daily-summary
supabase functions deploy weekly-summary
supabase functions deploy monthly-summary
```

### Step 4: Set Up Cron Jobs

Run this SQL in Supabase SQL Editor (see `MARK5_SETUP.md` for full SQL):

```sql
-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily summary (2 AM daily)
SELECT cron.schedule('daily-summary', '0 2 * * *', $$...$$);
```

### Step 5: Test It!

1. Log some activities today
2. Wait for nightly run (or trigger manually)
3. Check `/dashboard` - AI Summary section

## 🧪 Manual Testing

Trigger functions manually to test:

```bash
# Test daily summary
supabase functions invoke daily-summary

# Check your dashboard after a few seconds
```

## 📋 What Happens Next?

1. **Tonight at 2 AM** → Daily summary generated
2. **Sunday at 3 AM** → Weekly summary generated  
3. **2nd of month at 3 AM** → Monthly summary generated

All summaries appear automatically on your Dashboard!

## ❓ Need Help?

- Full setup guide: `MARK5_SETUP.md`
- Implementation details: `MARK5_SUMMARY.md`
- Troubleshooting: See MARK5_SETUP.md

## ✨ Features

- ✅ No client-side AI processing (all server-side)
- ✅ Batch processing (runs at night)
- ✅ Free Groq tier supported
- ✅ Scalable for thousands of users
- ✅ Works without AI (graceful degradation)

---

**Ready to go?** Follow the 5 steps above and you'll have AI summaries running tonight! 🚀

