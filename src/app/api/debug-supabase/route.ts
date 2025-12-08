import { NextResponse } from 'next/server';

/**
 * Debug route to verify Supabase environment variables in production
 * 
 * Access at: /api/debug-supabase
 * 
 * DELETE THIS FILE once you've verified the environment variables are set correctly
 */
export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const anonKeyLength = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0;

    return NextResponse.json({
        url: url ?? null,
        hasUrl: !!url,
        hasAnonKey,
        anonKeyLength,
        // Don't expose the actual key, just confirm it exists
        status: url && hasAnonKey ? '✅ Configured' : '❌ Missing variables',
        message: url && hasAnonKey
            ? 'Supabase environment variables are set correctly'
            : 'Missing Supabase environment variables. Check Vercel settings.',
    });
}

