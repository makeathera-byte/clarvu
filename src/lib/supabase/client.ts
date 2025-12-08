import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

// Runtime safety check for environment variables
if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
}

// Create browser client for client-side usage
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    }

    if (!supabaseAnonKey) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
}

// Legacy export for backward compatibility
// Only create if environment variables are available
function createLegacyClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
        console.error('❌ Missing Supabase env vars for legacy client');
        // Return a client with empty strings - it will fail gracefully when used
        // This prevents errors during module initialization
        return createBrowserClient<Database>('', '', {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        });
    }
    
    return createBrowserClient<Database>(url, key, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
}

export const supabase = createLegacyClient();

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return (
        process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ''
    );
};

// Re-export types for convenience
export * from './types';
