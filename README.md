# DayFlow

**DayFlow** - Track your day. Understand your patterns.

A cloud-only web application built with Next.js 15, Supabase, and Tailwind CSS.

## 🚀 Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ShadCN UI**
- **Supabase** (Authentication & Database)
- **Supabase Edge Functions** (AI Summary Generation)
- **Groq API** (Llama3/Mixtral AI Models)
- **Vercel** (Hosting)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🛠️ Local Development

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables (REQUIRED)

**Copy `.env.example` to `.env.local`** and fill in your values:

```bash
cp .env.example .env.local
```

**Required environment variables:**

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (REQUIRED for AI summaries)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq AI API Key (OPTIONAL - only needed for AI summaries)
GROQ_API_KEY=your_groq_api_key

# Node.js Options (optional - suppresses deprecation warnings)
NODE_OPTIONS=--no-deprecation
```

**How to get these values:**

1. **Supabase keys**: Go to your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API
2. **Groq API key**: Sign up at [console.groq.com](https://console.groq.com) and create an API key

> **Important:** Restart your development server after creating/updating `.env.local` - environment variables only load on startup.

### 4. Set up Supabase Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to the SQL Editor
3. Run the SQL from `supabase/schema.sql` to create all required tables

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🌐 Deploying to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI (if not already installed):

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

3. Follow the prompts to link your project

### Option 2: Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Click "Deploy"

### Environment Variables on Vercel

After creating your Vercel project, add these environment variables in your project settings:

1. Go to **Settings** → **Environment Variables**
2. Add the following:

   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`  
     **Value:** `https://yklexlqvofsxiajmewhy.supabase.co`

   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGV4bHF2b2ZzeGlham1ld2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjg4NTQsImV4cCI6MjA3OTkwNDg1NH0.xK4LjiXnpu2hooZvAfT560edCWfP6LxlgLTJO9z_giM`

3. Select all environments (Production, Preview, Development)
4. Redeploy your application

### Important Notes for Vercel Deployment

- ✅ The app is fully serverless and edge-compatible
- ✅ No server-side dependencies required
- ✅ Supabase client is edge-safe
- ✅ All routes work seamlessly on Vercel Functions
- ✅ Middleware runs on Vercel Edge

## 📁 Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── logs/          # Activity log endpoints
│   │   ├── categories/    # Category endpoints
│   │   ├── ai/            # AI summary endpoints (internal)
│   │   └── context/       # Context logging endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages & actions
│   ├── settings/          # Settings pages & actions
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── activity/          # Activity logging components
│   ├── ai/                # AI summary components
│   ├── charts/            # Chart components
│   ├── dashboard/         # Dashboard-specific components
│   ├── insights/          # Business insights components
│   ├── layout/            # Layout components (Navbar, AppShell)
│   ├── monitor/           # Activity monitoring components
│   ├── notifications/     # Reminder & notification components
│   ├── routine/           # Routine builder components
│   ├── settings/          # Settings form components
│   └── ui/                # ShadCN UI components
├── lib/
│   ├── ai/                # AI utilities (Groq, prompts, processors)
│   ├── api/               # API helpers (auth, responses)
│   ├── context/           # Context detection engine
│   ├── insights/          # Business metrics & pattern detection
│   ├── reminders/         # Reminder engine & constants
│   ├── suggestions/       # Smart suggestions engine
│   ├── supabase/          # Supabase clients & types
│   ├── utils/             # Utility functions
│   │   ├── time.ts        # Time formatting & calculations
│   │   ├── user.ts        # User/session helpers
│   │   ├── categories.ts  # Category utilities
│   │   └── auth.ts        # Auth helpers
│   ├── types.ts           # Shared TypeScript types
│   └── utils.ts           # General utilities (cn, etc.)
├── supabase/
│   ├── functions/         # Edge Functions
│   │   ├── daily-summary/
│   │   ├── weekly-summary/
│   │   └── monthly-summary/
│   └── migrations/        # Database migrations
├── middleware.ts          # Route protection
├── .env.local            # Environment variables (not committed)
└── .env.example          # Environment variable template
```

## 🔐 Authentication

DayFlow uses Supabase Authentication with:

- Email/Password authentication
- Protected routes via middleware
- Server-side session management
- Client-side auth state management

### Protected Routes

- `/dashboard` - Requires authentication
- `/settings` - Requires authentication

### Public Routes

- `/` - Landing page
- `/auth/login` - Login page
- `/auth/signup` - Sign up page

## 🗄️ Database Schema

The database includes the following tables:

- **activity_logs** - Individual activity entries
- **categories** - Activity categories (default + user-created)
- **user_settings** - User preferences and reminder settings
- **daily_summaries** - Daily AI summaries and focus scores
- **weekly_summaries** - Weekly AI summaries and insights
- **monthly_summaries** - Monthly AI summaries and insights
- **context_logs** - Context detection logs (for future AI training)

All tables have Row Level Security (RLS) enabled for data isolation.

### Setting up the database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Run migrations from `supabase/migrations/` in order
4. Or run the complete schema from `supabase/complete_schema.sql` (if available)

## 🎨 Design System

- **Color Palette:** Soft neutral tones (stone/gray)
- **Border Radius:** Rounded-xl (1rem) / Rounded-2xl (1.5rem)
- **Shadows:** Soft, subtle shadows
- **Background:** `#f6f6f7` (soft neutral)
- **Animations:** Smooth fade-in and hover effects

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤖 AI Features (MARK 5+)

DayFlow includes AI-powered summaries and insights:

- **Daily Summaries** - Generated nightly at 2 AM using Groq AI (Llama3/Mixtral)
- **Weekly Summaries** - Generated Sundays at 3 AM
- **Monthly Summaries** - Generated on 2nd of each month at 3 AM
- **Focus Scores** - Calculated from activity patterns (0-100)
- **Productivity Insights** - AI-generated insights and recommendations
- **Business Insights** - Revenue time, context switches, ROI scores
- **Routine Builder** - AI-assisted personalized routine generation

### AI Setup

1. Get a Groq API key from [console.groq.com](https://console.groq.com) (free tier available)
2. Add `GROQ_API_KEY` to `.env.local`
3. Deploy Edge Functions to Supabase:
   ```bash
   supabase functions deploy daily-summary
   supabase functions deploy weekly-summary
   supabase functions deploy monthly-summary
   ```
4. Set up cron jobs in Supabase Dashboard for automatic summary generation

> **Note:** The app works without AI - summaries are optional and enhance the experience.

## 🚀 Deploying Supabase Edge Functions

DayFlow uses Supabase Edge Functions for AI processing:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy daily-summary
supabase functions deploy weekly-summary
supabase functions deploy monthly-summary
```

See [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions) for more details.

## 📚 Additional Documentation

- **[TECH_DEBT.md](./TECH_DEBT.md)** - Known issues and technical debt
- **[MVP_SCOPE.md](./MVP_SCOPE.md)** - MVP feature scope and launch checklist
- **[MARK_10_NOTIFICATIONS.md](./MARK_10_NOTIFICATIONS.md)** - Notification system documentation

## 🐛 Troubleshooting

### Database errors
- Ensure all migrations are applied in Supabase SQL Editor
- Check that RLS policies are enabled
- Verify environment variables are set correctly

### AI summaries not generating
- Verify `GROQ_API_KEY` is set in environment
- Check Edge Functions are deployed
- Verify cron jobs are configured in Supabase Dashboard
- Check Edge Function logs in Supabase Dashboard

### Notification permissions
- Browser notifications require user permission
- If denied, an inline banner will appear
- Users can enable notifications in browser settings

## 🤝 Contributing

This is currently in MARK 10+ development. Core features are complete and the app is being polished for MVP launch.

## 📄 License

Private project - All rights reserved.

---

**Built with ❤️ using Next.js 15, Supabase, and Groq AI**
