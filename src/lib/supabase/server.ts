import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

// Create server client for Server Components, Server Actions, and Route Handlers
export async function createClient() {
    // Runtime safety check for environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
    }

    if (!supabaseAnonKey) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
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
