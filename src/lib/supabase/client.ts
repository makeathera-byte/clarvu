import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

// Create browser client for client-side usage
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        const error = new Error(
            'Missing Supabase environment variables. ' +
            'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your Vercel environment variables.'
        );
        console.error('Supabase client configuration error:', error.message);
        throw error;
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Legacy export for backward compatibility
// Only create if environment variables are available
function createLegacyClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
        // Return a client with empty strings - it will fail gracefully when used
        // This prevents errors during module initialization
        return createBrowserClient<Database>('', '');
    }
    
    return createBrowserClient<Database>(url, key);
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
