import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

// Create server client for Server Components, Server Actions, and Route Handlers
export async function createClient() {
    try {
        // Check environment variables first
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

        // Try to get cookies - this might fail in some edge cases
        let cookieStore;
        try {
            cookieStore = await cookies();
        } catch (cookieError) {
            console.error('Error accessing cookies:', cookieError);
            // If cookies() fails, we can still create a client but it won't have session management
            // This is a fallback for edge cases
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

        return createServerClient<Database>(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing user sessions.
                        }
                    },
                },
            }
        );
    } catch (error) {
        console.error('Error creating Supabase client:', error);
        // Re-throw the error so calling code can handle it
        throw error;
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
