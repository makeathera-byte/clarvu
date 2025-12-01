import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { isAdminEmail } = await import("@/lib/utils/admin");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip proxy for static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Admin route protection (check first, before other logic)
  if (pathname.startsWith("/ppadminpp")) {
    if (!supabaseUrl || !supabaseAnonKey) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    let response = NextResponse.next();
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (!isAdminEmail(user.email)) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("error", "admin_only");
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error("Admin route auth error:", error);
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build or if env vars are missing, skip auth checks
    // This allows the app to build without errors
    // Runtime errors will be caught by individual pages
    return supabaseResponse;
  }

  let user = null;

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
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

    // Refresh session if expired - required for Server Components
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError) {
      // Check if it's a network/DNS error
      if (authError.message?.includes("ENOTFOUND") || authError.message?.includes("getaddrinfo")) {
        console.error("❌ Cannot connect to Supabase - DNS/Network error. Check your NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
      } else {
        console.error("Supabase auth error in proxy:", authError.message);
      }
      // Continue without user (will redirect to login if needed)
      user = null;
    } else {
      user = authUser;
    }
  } catch (error: any) {
    // If Supabase is not available, continue without auth checks
    if (error.message?.includes("ENOTFOUND") || error.message?.includes("getaddrinfo")) {
      console.error("❌ Cannot connect to Supabase - DNS/Network error:", error.message);
      console.error("   Check your NEXT_PUBLIC_SUPABASE_URL environment variable");
      console.error("   Current URL:", supabaseUrl);
    } else {
      console.error("Supabase error in proxy:", error.message || error);
    }
    return supabaseResponse;
  }

  // Protected routes
  const protectedRoutes = ["/dashboard", "/settings"];
  const authRoutes = ["/auth/login", "/auth/signup"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Log visits for dynamic pages (only if not admin route and not API route)
  if (
    !pathname.startsWith("/ppadminpp") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    (pathname === "/" ||
      pathname.startsWith("/auth/") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/history"))
  ) {
    // Log visit asynchronously (don't block request)
    logVisit(request, user).catch((err) => {
      console.error("Error logging visit:", err);
    });
  }

  return supabaseResponse;
}

async function logVisit(request: NextRequest, user: any) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return;
    }

    // Use service role key to bypass RLS for server-side inserts
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const pathname = request.nextUrl.pathname;
    const userId = user?.id || null;
    const now = new Date();
    
    // Deduplication: Check if the same user visited the same path in the last 30 seconds
    // This prevents multiple visits from being logged for the same page load
    // (Next.js makes multiple requests per page, React StrictMode causes double renders, etc.)
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000).toISOString();
    
    const { data: recentVisit } = await supabase
      .from("visits")
      .select("id")
      .eq("path", pathname)
      .eq("user_id", userId) // Match both path and user_id
      .gte("visited_at", thirtySecondsAgo)
      .limit(1)
      .maybeSingle();
    
    // If a visit was logged recently for this user+path, skip logging
    if (recentVisit) {
      // Duplicate visit detected, skip logging
      return;
    }

    // Get device info from user agent
    const userAgent = request.headers.get("user-agent") || "";
    let device = "unknown";
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      device = "mobile";
    } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
      device = "tablet";
    } else {
      device = "desktop";
    }

    // Get country from multiple sources (prioritize user's explicit country setting)
    let country = "unknown";
    
    // First, try to get country directly from user_settings (if logged in)
    // This is the most accurate as it's what the user explicitly selected during signup
    if (userId) {
      try {
        const { data: userSettings } = await supabase
          .from("user_settings")
          .select("country, timezone")
          .eq("user_id", userId)
          .maybeSingle();
        
        // Prioritize explicit country setting
        if (userSettings?.country && userSettings.country !== "unknown") {
          country = userSettings.country.toUpperCase();
          console.log(`📍 Using explicit country from user_settings for user ${userId}: ${country}`);
        } else if (userSettings?.timezone && userSettings.timezone !== "UTC") {
          // Fallback to country from timezone if no explicit country
          const { getCountryFromTimezone } = await import("@/lib/utils/timezone");
          const countryFromTz = getCountryFromTimezone(userSettings.timezone);
          if (countryFromTz && countryFromTz !== "unknown") {
            country = countryFromTz;
            console.log(`📍 Using country from timezone for user ${userId}: ${country} (timezone: ${userSettings.timezone})`);
          }
        }
      } catch (error) {
        // Silently fail, fall back to IP detection
        console.error("Error getting country from user_settings:", error);
      }
    }
    
    // If no country from timezone, try IP geolocation
    if (country === "unknown") {
      // Get country from request (tries headers first, then IP geolocation)
      // Use timeout to prevent blocking if API is slow
      const { getCountryFromRequest } = await import("@/lib/analytics/getCountryFromRequest");
      const countryPromise = getCountryFromRequest(request);
      const timeoutPromise = new Promise<string>((resolve) => 
        setTimeout(() => resolve("unknown"), 2000) // 2 second timeout
      );
      country = await Promise.race([countryPromise, timeoutPromise]);
    }

    // Insert visit
    const { error } = await supabase.from("visits").insert({
      user_id: userId,
      path: pathname,
      device,
      country,
      visited_at: now.toISOString(),
    });
    
    if (error) {
      console.error("Error inserting visit:", error);
    }
  } catch (error) {
    // Silently fail - don't break the app if logging fails
    console.error("Visit logging error:", error);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


