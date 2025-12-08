# Supabase Authentication Redirect URLs

## Required Configuration

Configure these redirect URLs in your Supabase project to enable authentication.

---

## 🔧 Setup Instructions

1. **Go to Supabase Dashboard**
   - Navigate to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **Authentication** → **URL Configuration**

2. **Configure Site URL**
   - Set **Site URL** to your Vercel production domain:
   ```
   https://your-app.vercel.app
   ```
   - Replace `your-app` with your actual Vercel project name

3. **Add Redirect URLs**
   - In the **Redirect URLs** section, click "Add URL"
   - Add each of the following URLs (one per line):

---

## 📋 Required Redirect URLs

Add these **exact** URLs to the "Redirect URLs" list:

```
https://your-app.vercel.app/**
https://your-app.vercel.app/auth/login
https://your-app.vercel.app/auth/signup
https://your-app.vercel.app/dashboard
```

**Replace `your-app` with your actual Vercel project name.**

---

## 🔄 Wildcard Pattern (Recommended)

For maximum flexibility, use the wildcard pattern:

```
https://your-app.vercel.app/**
```

This single entry will match all paths under your domain.

---

## 🧪 Preview/Development URLs

If you want to test with preview deployments, also add:

```
https://your-app-*.vercel.app/**
```

Or add specific preview URLs as needed.

---

## 📧 Email Templates

The following redirect URLs are used in email templates:

### Email Verification
- **Redirect URL:** `https://your-app.vercel.app/auth/login`
- Used when users click the verification link in their email

### Password Reset
- **Redirect URL:** `https://your-app.vercel.app/auth/login`
- Used when users reset their password

### Magic Link
- **Redirect URL:** `https://your-app.vercel.app/auth/login`
- Used when users sign in with a magic link

---

## ✅ Verification

After configuring:

1. **Test Signup**
   - Go to `https://your-app.vercel.app/auth/signup`
   - Create a new account
   - Check your email for verification link
   - Click the link - it should redirect to `/auth/login`

2. **Test Login**
   - Go to `https://your-app.vercel.app/auth/login`
   - Sign in with your credentials
   - Should redirect to `/dashboard`

3. **Check Browser Console**
   - Open browser DevTools → Console
   - Look for any redirect or origin errors
   - Should see no Supabase-related errors

---

## 🚨 Common Issues

### "Invalid redirect URL"
- **Cause:** The redirect URL in your code doesn't match what's configured in Supabase
- **Fix:** Ensure the URL in `signUpAction` matches one of the URLs in Supabase settings

### "Origin not allowed"
- **Cause:** Your Vercel domain isn't in the allowed origins list
- **Fix:** Add your Vercel domain to the redirect URLs list

### "Email verification link doesn't work"
- **Cause:** The redirect URL in the email doesn't match Supabase settings
- **Fix:** Check that `emailRedirectTo` in signup action matches a configured redirect URL

---

## 📝 Code Reference

The redirect URL is configured in:
- `src/app/auth/signup/actions.ts` - `emailRedirectTo` option
- Uses `NEXT_PUBLIC_APP_URL` environment variable if set
- Falls back to auto-detection from request

---

## 🔐 Security Note

- Only add domains you own to the redirect URLs
- Never add `localhost` or `127.0.0.1` to production settings
- Use wildcards (`**`) carefully - they match all paths

