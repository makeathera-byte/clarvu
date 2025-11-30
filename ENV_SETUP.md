# Environment Variables Setup - REQUIRED

## 🚨 Error Fix: Missing Supabase Environment Variables

If you're seeing this error:
```
Your project's URL and Key are required to create a Supabase client!
```

**Solution:** Create a `.env.local` file in the root directory.

---

## Quick Fix Steps

### Step 1: Create `.env.local` file

Create a new file in `D:\DayFlow\web\.env.local` with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yklexlqvofsxiajmewhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGV4bHF2b2ZzeGlham1ld2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjg4NTQsImV4cCI6MjA3OTkwNDg1NH0.xK4LjiXnpu2hooZvAfT560edCWfP6LxlgLTJO9z_giM
```

### Step 2: Restart Development Server

**CRITICAL:** After creating `.env.local`, you MUST restart your dev server:

1. Stop the server (press `Ctrl+C` in terminal)
2. Run `npm run dev` again

Environment variables are only loaded when the server starts!

### Step 3: Verify

The app should now work without errors.

---

## How to Create the File

### Option 1: Using VS Code
1. Open VS Code in `D:\DayFlow\web`
2. Click "New File" 
3. Name it `.env.local` (make sure it starts with a dot)
4. Paste the content above
5. Save

### Option 2: Using Command Line (PowerShell)
```powershell
cd D:\DayFlow\web
@"
NEXT_PUBLIC_SUPABASE_URL=https://yklexlqvofsxiajmewhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGV4bHF2b2ZzeGlham1ld2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjg4NTQsImV4cCI6MjA3OTkwNDg1NH0.xK4LjiXnpu2hooZvAfT560edCWfP6LxlgLTJO9z_giM
"@ | Out-File -FilePath .env.local -Encoding utf8
```

### Option 3: Using Notepad
1. Open Notepad
2. Paste the two lines from above
3. Save As → File name: `.env.local` (include the dot!)
4. Save to `D:\DayFlow\web\` folder
5. Make sure "All Files" is selected in file type dropdown

---

## Troubleshooting

### File is created but error persists
- ✅ Check the file name is exactly `.env.local` (not `env.local` or `.env.local.txt`)
- ✅ Verify the file is in `D:\DayFlow\web\` (root directory, same as `package.json`)
- ✅ Restart your dev server completely
- ✅ Check there are no extra spaces before `NEXT_PUBLIC_`

### Still seeing errors?
- The middleware has been updated to handle missing env vars gracefully
- Server components will show helpful error messages
- Check browser console for specific error details

---

## File Location

The `.env.local` file must be here:
```
D:\DayFlow\web\
  ├── .env.local          ← Create this file here
  ├── package.json
  ├── next.config.ts
  └── ...
```

---

## What Changed

The code has been updated to:
- ✅ Provide clearer error messages
- ✅ Handle missing env vars more gracefully in middleware
- ✅ Give better debugging information

But you still need to create `.env.local` for the app to work!

