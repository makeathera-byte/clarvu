import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

// Create server client for Server Components, Server Actions, and Route Handlers
export async function createClient() {
    // Check environment variables first - fail fast if missing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        const error = new Error(
            'Missing Supabase environment variables. ' +
            'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your Vercel environment variables. ' +
            'Go to Vercel Dashboard > Your Project > Settings > Environment Variables to add them.'
        );
        console.error('Supabase configuration error:', error.message);
        console.error('Current env check:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
            urlLength: supabaseUrl?.length || 0,
            keyLength: supabaseAnonKey?.length || 0,
        });
        throw error;
    }

    try {
        // Try to get cookies - wrap in try-catch to handle edge cases
        const cookieStore = await cookies();

        return createServerClient<Database>(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        try {
                            return cookieStore.getAll();
                        } catch {
                            return [];
                        }
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                try {
                                    cookieStore.set(name, value, options);
                                } catch {
                                    // Ignore individual cookie set errors
                                }
                            });
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing user sessions.
                        }
                    },
                },
            }
        );
    } catch (error) {
        // If cookies() fails, create a client without cookie management
        // This allows the app to continue functioning even if cookies aren't available
        console.error('Error accessing cookies in createClient, using fallback:', error);
        
        return createServerClient<Database>(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return [];
                    },
                    setAll() {
                        // No-op if cookies aren't available
                    },
                },
            }
        );
    }
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

// Helper to get user profile
export async function getUserProfile(userId: string) {
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return profile;
}
