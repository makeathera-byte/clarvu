# AI API Layer Implementation - Status

## Architecture Overview

The AI processing pipeline is structured as:

1. **Processors** (`/lib/ai/runDaily.ts`, etc.) - TypeScript functions that process data and call Groq
   - Used by Next.js server actions or can be called directly
   - Return structured results without DB writes

2. **Edge Functions** (`/supabase/functions/*`) - Deno functions that run on a schedule
   - Process data for all users
   - Post results to internal API routes
   - Use service role key for authentication

3. **Internal API Routes** (`/app/api/ai/*`) - Next.js route handlers
   - Validate service role key
   - Write results to database
   - Protect from frontend access

## Implementation Strategy

Since Edge Functions run in Deno and can't import Next.js TypeScript files, we have two approaches:

### Option 1: Edge Functions Call Internal API Routes (Recommended)
- Edge functions process data inline
- Edge functions POST results to `/api/ai/*` routes
- API routes handle database writes
- Clean separation of concerns

### Option 2: Shared Deno-compatible Utilities
- Create Deno-compatible versions of processors
- Edge functions import and use them
- More code duplication

**We'll use Option 1** for cleaner architecture.

## Next Steps

1. Update edge functions to use compact prompts (inline)
2. Update edge functions to POST to API routes after processing
3. Verify API routes accept the data format
4. Add cron.json configuration

