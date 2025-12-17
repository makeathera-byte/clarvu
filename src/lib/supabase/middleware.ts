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

        // Refresh session first to ensure we have the latest auth state
        // This is especially important after OAuth callbacks
        const refreshResult = await supabase.auth.refreshSession();
        if (refreshResult.error) {
            console.log(`[Middleware] Refresh session error:`, refreshResult.error.message);
        }

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        // Enhanced logging for OAuth callback debugging
        if (request.nextUrl.pathname === '/dashboard' && !user) {
            console.log(`[Middleware] ⚠️ Dashboard access - No user found`);
            console.log(`[Middleware] Refresh result:`, refreshResult.data?.session ? 'Session exists' : 'No session');
            console.log(`[Middleware] User error:`, userError?.message || 'None');
            const allCookies = request.cookies.getAll();
            console.log(`[Middleware] Total cookies: ${allCookies.length}`);
            const supabaseCookies = allCookies.filter(c => 
                c.name.includes('auth') || c.name.includes('supabase') || c.name.includes('sb-')
            );
            console.log(`[Middleware] Supabase cookies found: ${supabaseCookies.length}`);
            if (supabaseCookies.length > 0) {
                console.log(`[Middleware] Cookie names:`, supabaseCookies.map(c => c.name).join(', '));
            } else {
                console.log(`[Middleware] ❌ No Supabase auth cookies found! This is the problem.`);
            }
            
            // Check if we're coming from callback
            const referer = request.headers.get('referer');
            if (referer?.includes('/auth/callback')) {
                console.log(`[Middleware] ⚠️ Coming from callback but no session - cookies may not be set yet`);
            }
        }

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

        // Log for debugging (only in development or when user is missing on protected route)
        if (!user && isProtectedRoute) {
            console.log(`[Middleware] No user found for protected route: ${request.nextUrl.pathname}`);
            if (userError) {
                console.log(`[Middleware] Auth error:`, userError.message);
            }
            // Log cookies for debugging (don't log values in production)
            const authCookies = request.cookies.getAll().filter(c => 
                c.name.includes('auth') || c.name.includes('supabase')
            );
            console.log(`[Middleware] Auth cookies found: ${authCookies.length}`, 
                authCookies.map(c => c.name).join(', '));
        }

        // Redirect unauthenticated users from protected routes to login
        // BUT: Give a grace period for OAuth callbacks - if we just came from callback,
        // wait a moment for cookies to propagate
        if (!user && isProtectedRoute) {
            const referer = request.headers.get('referer');
            const isFromCallback = referer?.includes('/auth/callback');
            
            if (isFromCallback) {
                console.log(`[Middleware] ⚠️ No user but coming from callback - allowing through with warning`);
                // Don't redirect immediately - let the page try to load
                // The dashboard layout will handle the redirect if needed
                return supabaseResponse;
            }
            
            console.log(`[Middleware] Redirecting unauthenticated user from ${request.nextUrl.pathname} to login`);
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
