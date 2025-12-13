import { createClient } from "@supabase/supabase-js";
import { Database } from './types';

/**
 * Client-side Supabase client for public reads only
 * Uses NEXT_PUBLIC_ env vars which are exposed to the browser
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== 'undefined') {
    // Only log in browser
    if (!supabaseUrl) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!supabaseAnonKey) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
}

// Use fallback values to prevent crashes, but operations will fail gracefully
export const supabaseClient = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Enable OAuth callback detection
    },
  }
);

// Legacy export for backward compatibility
export const supabase = supabaseClient;

// Re-export types for convenience
export * from './types';
