import { createBrowserClient } from "@supabase/ssr";
import { Database } from './types';

/**
 * Client-side Supabase client using SSR for proper cookie handling
 * Uses NEXT_PUBLIC_ env vars which are exposed to the browser
 * This ensures cookies are properly set and accessible to middleware
 * 
 * Supports both authentication methods:
 * - Email/password authentication
 * - Google Identity Services via signInWithIdToken (Clarvu-owned OAuth)
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

          // Set path - default to root if not specified
          cookieString += `; Path=${options?.path || '/'}`;

          // Set SameSite - important for cross-site requests
          cookieString += `; SameSite=${options?.sameSite || 'lax'}`;

          // Set MaxAge if provided
          if (options?.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`;
          }

          // Set domain if provided (usually not needed for same-domain)
          if (options?.domain) {
            cookieString += `; Domain=${options.domain}`;
          }

          // Set Secure flag if in production or explicitly requested
          if (options?.secure || (typeof window !== 'undefined' && window.location.protocol === 'https:')) {
            cookieString += `; Secure`;
          }

          // Note: HttpOnly cannot be set via document.cookie (security feature)
          // It must be set server-side, which Supabase SSR handles automatically

          document.cookie = cookieString;
          console.log(`🍪 Set cookie: ${name} (Path: ${options?.path || '/'}, SameSite: ${options?.sameSite || 'lax'})`);
        });
      },
    },
  }
);

// Legacy export for backward compatibility
export const supabase = supabaseClient;

// Re-export types for convenience
export * from './types';
