import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

    // Check if user is authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/signup',
        '/pricing',
        '/api/auth/callback',
    ];

    // PWA and static files that should never be redirected
    const pwaFiles = ['/sw.js', '/manifest.json', '/workbox-', '/offline.html'];
    const isPwaFile = pwaFiles.some(file => pathname.startsWith(file));

    // Check if current path is public
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/')) || isPwaFile;

    // If user is not authenticated and trying to access protected route
    if (!user && !isPublicRoute) {
        const redirectUrl = url.clone();
        redirectUrl.pathname = '/auth/login';
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated and trying to access login/signup, redirect to dashboard
    if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
        const redirectUrl = url.clone();
        redirectUrl.pathname = '/dashboard';
        return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - icon.png
         * - sw.js (service worker)
         * - manifest.json (PWA manifest)
         * - workbox files
         */
        '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|workbox-|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
