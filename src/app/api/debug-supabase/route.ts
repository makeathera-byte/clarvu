import { NextResponse } from 'next/server';

/**
 * Debug route to verify Supabase environment variables in production
 * 
 * Access at: /api/debug-supabase
 * 
 * DELETE THIS FILE once you've verified the environment variables are set correctly
 */
export async function GET() {
    // Check both public and non-public env vars
    const serverUrl = process.env.SUPABASE_URL;
    const serverKey = process.env.SUPABASE_ANON_KEY;
    const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const url = serverUrl || publicUrl;
    const hasAnonKey = !!(serverKey || publicKey);
    
    return NextResponse.json({
        configured: !!(url && hasAnonKey),
        url: url ? `${url.substring(0, 30)}...` : null,
        hasServerUrl: !!serverUrl,
        hasServerKey: !!serverKey,
        hasPublicUrl: !!publicUrl,
        hasPublicKey: !!publicKey,
        usingPublicVars: !!(publicUrl && !serverUrl),
        env: process.env.NODE_ENV,
        status: url && hasAnonKey ? '✅ Configured' : '❌ Missing variables',
        message: url && hasAnonKey
            ? 'Supabase environment variables are set correctly'
            : 'Missing Supabase environment variables. Check VERCEL_ENV_VARS.md for setup instructions.',
    });
}

