# AI API Status Check

## 🔍 Current Status

This document helps you verify if the Groq AI API is properly configured and working in DayFlow.

---

## ✅ Quick Check

### 1. Check Environment Variable

Run this command to check if `GROQ_API_KEY` is configured:

```bash
# Windows PowerShell
if (Test-Path .env.local) { Get-Content .env.local | Select-String -Pattern "GROQ_API_KEY" }

# Linux/Mac
grep GROQ_API_KEY .env.local
```

**Expected:** You should see a line like:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

If **NOT found**, you need to add it to `.env.local`:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

---

## 🧪 Test the API

### Method 1: Test API Route (Recommended)

I've created a test endpoint at `/api/test-ai`. Once your dev server is running:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Visit the test endpoint:**
   ```
   http://localhost:3000/api/test-ai
   ```

   Or use curl:
   ```bash
   curl http://localhost:3000/api/test-ai
   ```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "apiKeyConfigured": true,
    "apiKeyPrefix": "gsk_xxxxx...",
    "basicTest": {
      "success": true,
      "response": "Hello, DayFlow!"
    },
    "jsonTest": {
      "success": true,
      "parsed": {
        "status": "ok",
        "message": "JSON mode working"
      }
    },
    "summary": "All AI API tests passed! ✅"
  }
}
```

### Method 2: Test via Routine Generation

1. Go to Dashboard → **Routine** tab
2. Click **Regenerate** button
3. Check if routine includes AI-generated explanation

If AI is working, you'll see a personalized explanation like:
> "Your best focus happens between 10AM–12PM. Schedule your most important work during this window..."

If AI fails, it falls back to baseline routine with generic explanation.

---

## 🔧 Where AI is Used

### 1. **Routine Coach** (`/lib/ai/runRoutineCoach.ts`)
   - **Used in:** Dashboard → Routine tab
   - **Function:** Generates personalized daily routines
   - **Model:** `llama-3.1-8b-instant`
   - **Status:** ✅ Implemented

### 2. **Daily/Weekly/Monthly Summaries** (Edge Functions)
   - **Used in:** Dashboard → Daily/Weekly/Monthly tabs
   - **Function:** AI-generated summaries
   - **Location:** `/supabase/functions/`
   - **Note:** These require Edge Functions deployment

---

## ⚠️ Troubleshooting

### Error: "GROQ_API_KEY environment variable is required"

**Solution:**
1. Create or edit `.env.local` in project root
2. Add:
   ```
   GROQ_API_KEY=your_api_key_here
   ```
3. Restart dev server (`npm run dev`)

### Error: "Groq API error: 401 Unauthorized"

**Solution:**
- Your API key might be invalid or expired
- Get a new key from: https://console.groq.com/
- Update `.env.local` with new key

### Error: "Groq API error: 429 Rate limit exceeded"

**Solution:**
- You've hit the rate limit
- Wait a few minutes and try again
- Check your Groq console for limits

### AI Not Working in Routine Tab

**Check:**
1. Is `GROQ_API_KEY` set in `.env.local`?
2. Is dev server restarted after adding the key?
3. Check browser console for errors
4. Check server logs for AI errors

The routine will still work with baseline (non-AI) routine, but won't have personalized explanation.

---

## 📝 Get Groq API Key

1. Go to: https://console.groq.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key (starts with `gsk_`)
6. Add to `.env.local`:

```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

**Free Tier:**
- Groq offers free tier with generous limits
- Fast inference with Llama models
- Perfect for DayFlow's AI features

---

## ✅ Verification Checklist

- [ ] `.env.local` file exists
- [ ] `GROQ_API_KEY` is in `.env.local`
- [ ] API key is valid (starts with `gsk_`)
- [ ] Dev server has been restarted
- [ ] Test endpoint `/api/test-ai` returns success
- [ ] Routine tab generates AI-enhanced routines

---

## 🚀 Next Steps

Once API is verified working:

1. **Test Routine Generation:**
   - Go to Dashboard → Routine tab
   - Generate a routine
   - Verify AI explanation appears

2. **Monitor Usage:**
   - Check Groq console for API usage
   - Monitor error logs
   - Watch for rate limits

3. **Deploy Edge Functions** (Optional):
   - For daily/weekly/monthly AI summaries
   - See `supabase/functions/` for details

---

**Last Updated:** Mark 9
**API Status:** Ready to test

