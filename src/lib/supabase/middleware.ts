import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    try {
        let supabaseResponse = NextResponse.next({
            request,
        });

        // Use non-public env vars first, fallback to public for backward compatibility
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Runtime safety check
        if (!supabaseUrl) {
            console.error('❌ Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) in middleware');
            if (process.env.NODE_ENV === 'production') {
                console.error('⚠️ PRODUCTION ERROR: Supabase URL is missing in middleware!');
            }
        }
        if (!supabaseAnonKey) {
            console.error('❌ Missing SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in middleware');
            if (process.env.NODE_ENV === 'production') {
                console.error('⚠️ PRODUCTION ERROR: Supabase anon key is missing in middleware!');
            }
        }

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Missing Supabase environment variables in middleware');
            return supabaseResponse;
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        // IMPORTANT: Avoid writing any logic between createServerClient and
        // supabase.auth.getUser(). A simple mistake could make your application
        // vulnerable to security issues.

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const isAuthCallback = request.nextUrl.pathname === '/auth/callback';
        const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
        const isProtectedRoute =
            request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/analytics') ||
            request.nextUrl.pathname.startsWith('/focus') ||
            request.nextUrl.pathname.startsWith('/ppadminpp') ||
            request.nextUrl.pathname.startsWith('/settings');

        // Allow auth callback to proceed (it handles its own redirect logic)
        if (isAuthCallback) {
            return supabaseResponse;
        }

        // Redirect unauthenticated users from protected routes to login
        if (!user && isProtectedRoute) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            return NextResponse.redirect(url);
        }

        // Redirect authenticated users from auth routes to dashboard (except callback)
        if (user && isAuthRoute && !isAuthCallback) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }

        return supabaseResponse;
    } catch (error) {
        console.error('Middleware error:', error);
        // Return a response even if there's an error to prevent the app from crashing
        return NextResponse.next({ request });
    }
}
