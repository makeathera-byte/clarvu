import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Server-side Supabase client for auth, inserts, and protected operations
 * Uses non-public env vars (SUPABASE_URL, SUPABASE_ANON_KEY) for security
 * Falls back to NEXT_PUBLIC_ vars if non-public vars are not set (for backward compatibility)
 */
export async function createClient() {
    // Use non-public env vars first, fallback to public for backward compatibility
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Runtime safety check for environment variables
    if (!supabaseUrl) {
        console.error('❌ Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
        if (process.env.NODE_ENV === 'production') {
            console.error('⚠️ PRODUCTION ERROR: Supabase URL is missing!');
        }
    }

    if (!supabaseAnonKey) {
        console.error('❌ Missing SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
        if (process.env.NODE_ENV === 'production') {
            console.error('⚠️ PRODUCTION ERROR: Supabase anon key is missing!');
        }
    }

    // Warn if using public vars on server in production
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
        console.warn('⚠️ WARNING: Using NEXT_PUBLIC_SUPABASE_URL on server. Consider using SUPABASE_URL instead.');
    }

    // Helper to safely get cookies
    const getCookieStore = async () => {
        try {
            return await cookies();
        } catch (error) {
            console.error('Error accessing cookies:', error);
            return null;
        }
    };

    // If env vars are missing, create a minimal client that will fail gracefully
    // This prevents the entire app from crashing during render
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('⚠️ Supabase env vars missing - creating fallback client');
        console.error('Current env check:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
            urlLength: supabaseUrl?.length || 0,
            keyLength: supabaseAnonKey?.length || 0,
        });
        
        // Return a client with placeholders - operations will fail gracefully
        const cookieStore = await getCookieStore();
        return createServerClient<Database>(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseAnonKey || 'placeholder-key',
            {
                cookies: {
                    getAll() {
                        try {
                            return cookieStore?.getAll() || [];
                        } catch {
                            return [];
                        }
                    },
                    setAll() {
                        // No-op
                    },
                },
            }
        );
    }

    // Get cookies safely
    const cookieStore = await getCookieStore();

    // Create client with proper cookie handling
    return createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    try {
                        return cookieStore?.getAll() || [];
                    } catch {
                        return [];
                    }
                },
                setAll(cookiesToSet) {
                    try {
                        if (cookieStore) {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                try {
                                    cookieStore.set(name, value, options);
                                } catch {
                                    // Ignore individual cookie set errors
                                }
                            });
                        }
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        }
    );
}

// Helper to get current user
export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper to get current session
export async function getSession() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Helper to get user profile with retry logic
// Profiles are created by database trigger, so we may need to wait briefly
export async function getUserProfile(userId: string, retry = true) {
    const supabase = await createClient();
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    // If profile not found and retry is enabled, wait and retry once
    if (!profile && retry && error?.code === 'PGRST116') {
        // Wait 1 second for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry once
        const retryResult = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        profile = retryResult.data;
        error = retryResult.error;
    }
    
    return profile;
}
