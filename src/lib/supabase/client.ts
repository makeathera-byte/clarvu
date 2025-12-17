import { createBrowserClient } from "@supabase/ssr";
import { Database } from './types';

/**
 * Client-side Supabase client using SSR for proper cookie handling
 * Uses NEXT_PUBLIC_ env vars which are exposed to the browser
 * This ensures cookies are properly set and accessible to middleware
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

// Use SSR browser client for proper cookie handling with middleware
// This ensures cookies are set in a way that middleware can read them
export const supabaseClient = createBrowserClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    cookies: {
      getAll() {
        // Check if we're in browser environment
        if (typeof document === 'undefined') {
          return [];
        }
        return document.cookie.split('; ').map(cookie => {
          const [name, ...rest] = cookie.split('=');
          return { name, value: rest.join('=') };
        });
      },
      setAll(cookiesToSet) {
        // Check if we're in browser environment
        if (typeof document === 'undefined') {
          return;
        }
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieString = `${name}=${value}`;
          if (options?.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`;
          }
          if (options?.domain) {
            cookieString += `; Domain=${options.domain}`;
          }
          if (options?.path) {
            cookieString += `; Path=${options.path}`;
          }
          if (options?.sameSite) {
            cookieString += `; SameSite=${options.sameSite}`;
          }
          if (options?.secure) {
            cookieString += `; Secure`;
          }
          if (options?.httpOnly) {
            cookieString += `; HttpOnly`;
          }
          document.cookie = cookieString;
        });
      },
    },
  }
);

// Legacy export for backward compatibility
export const supabase = supabaseClient;

// Re-export types for convenience
export * from './types';
