import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { logSignup } from "@/lib/analytics/logSignup";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTimezoneFromCountry } from "@/lib/utils/timezone";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const token = requestUrl.searchParams.get("token");
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  // Log all params for debugging
  console.log("🔍 Callback route called with params:", {
    token_hash: token_hash ? "present" : "missing",
    token: token ? "present" : "missing",
    code: code ? "present" : "missing",
    type,
    next,
    allParams: Object.fromEntries(requestUrl.searchParams.entries())
  });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  let error: any = null;
  let data: any = null;

  // Handle different Supabase email verification flows
  if (code) {
    // Email confirmation uses code exchange
    console.log("📧 Using code exchange for email confirmation");
    const { error: exchangeError, data: exchangeData } = await supabase.auth.exchangeCodeForSession(code);
    error = exchangeError;
    data = exchangeData;
  } else if (token_hash && type) {
    // OTP verification with token_hash
    console.log("🔐 Using token_hash verification");
    const { error: verifyError, data: verifyData } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });
    error = verifyError;
    data = verifyData;
  } else if (token && type) {
    // OTP verification with token
    console.log("🔐 Using token verification");
    const { error: verifyError, data: verifyData } = await supabase.auth.verifyOtp({
      type: type as any,
      token,
    });
    error = verifyError;
    data = verifyData;
  } else {
    console.error("❌ No valid verification parameters provided");
    const redirectUrl = new URL("/auth/login", requestUrl.origin);
    redirectUrl.searchParams.set("error", "verification_failed");
    redirectUrl.searchParams.set("reason", "missing_params");
    return NextResponse.redirect(redirectUrl);
  }
  
  if (error) {
    console.error("❌ Email verification error:", error);
    const redirectUrl = new URL("/auth/login", requestUrl.origin);
    redirectUrl.searchParams.set("error", "verification_failed");
    redirectUrl.searchParams.set("reason", error.message || "unknown_error");
    return NextResponse.redirect(redirectUrl);
  }

  if (!data?.user) {
    console.error("❌ Verification failed - no user data");
    const redirectUrl = new URL("/auth/login", requestUrl.origin);
    redirectUrl.searchParams.set("error", "verification_failed");
    redirectUrl.searchParams.set("reason", "no_user_data");
    return NextResponse.redirect(redirectUrl);
  }

  // Session is established by exchangeCodeForSession or verifyOtp
  // Verify the session was created
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log("✅ Email verified and session established for user:", data.user.email);
  } else {
    console.warn("⚠️ Session not immediately available, but cookies should be set");
  }
  
  // Check if this is a new signup (for code exchange, check if user was just created)
  // For code exchange, we can check if user email_confirmed_at matches created_at (recent)
  const isNewSignup = type === "signup" || 
                     type === "email" || 
                     (code && data.user.created_at && data.user.email_confirmed_at && 
                      new Date(data.user.email_confirmed_at).getTime() - new Date(data.user.created_at).getTime() < 60000); // Within 1 minute
  
  if (isNewSignup) {
        try {
          // Check if signup already logged (prevent duplicates)
          const adminClient = createAdminClient();
          const { data: existing } = await adminClient
            .from("signup_events")
            .select("id")
            .eq("user_id", data.user.id)
            .single();

          // Get country from multiple sources
          const countryParam = requestUrl.searchParams.get("country");
          const countryFromMetadata = data.user.user_metadata?.country;
          let country = countryParam || countryFromMetadata;
          
          console.log("🔍 Country detection in callback:", {
            countryParam,
            countryFromMetadata,
            initialCountry: country,
            userMetadata: data.user.user_metadata,
            allParams: Object.fromEntries(requestUrl.searchParams.entries())
          });
          
          // If signup not logged yet, log it
          if (!existing) {
            await logSignup(data.user.id, data.user.email || "", country);
            console.log("✅ Signup logged in callback:", data.user.email);
          }
          
          // ALWAYS try to get country from signup_events (most reliable source)
          const { data: signupEvent } = await adminClient
            .from("signup_events")
            .select("country")
            .eq("user_id", data.user.id)
            .maybeSingle();
          
          if (signupEvent?.country && signupEvent.country !== "unknown" && signupEvent.country !== null) {
            country = signupEvent.country;
            console.log("📦 Using country from signup_events:", country);
          }
          
          // Check current user_settings
          const { data: existingSettings } = await adminClient
            .from("user_settings")
            .select("country, timezone")
            .eq("user_id", data.user.id)
            .maybeSingle();
          
          // ALWAYS save country if we have it and it's different or missing
          if (country && country !== "unknown" && country !== null && country !== "") {
            const normalizedCountry = String(country).toUpperCase().trim();
            
            // Validate country code
            if (normalizedCountry.length !== 2) {
              console.warn("⚠️ Invalid country code length:", normalizedCountry);
            } else {
              // Check if we need to update
              const needsUpdate = !existingSettings || 
                !existingSettings.country || 
                existingSettings.country.toUpperCase().trim() !== normalizedCountry;
              
              if (needsUpdate) {
                try {
                  const timezone = getTimezoneFromCountry(normalizedCountry);
                  
                  console.log("💾 Saving country/timezone to user_settings:", {
                    userId: data.user.id,
                    country: normalizedCountry,
                    timezone,
                    existingCountry: existingSettings?.country
                  });
                  
                  const { error: settingsError, data: savedData } = await adminClient
                    .from("user_settings")
                    .upsert({
                      user_id: data.user.id,
                      country: normalizedCountry,
                      timezone,
                    }, {
                      onConflict: "user_id"
                    })
                    .select("country, timezone")
                    .single();
                  
                  if (settingsError) {
                    console.error("❌ Error saving country/timezone in callback:", settingsError);
                  } else {
                    console.log("✅ Country and timezone saved successfully:", savedData);
                  }
                } catch (settingsError) {
                  console.error("❌ Exception saving country/timezone in callback:", settingsError);
                }
              } else {
                console.log("✅ Country already saved correctly:", normalizedCountry);
              }
            }
          } else {
            console.warn("⚠️ No valid country found. Sources checked:", {
              countryParam,
              countryFromMetadata,
              signupEventCountry: signupEvent?.country
            });
          }
        } catch (logError) {
          // Don't fail the signup if logging fails
          console.error("Error logging signup in callback:", logError);
        }
      }

  // Redirect to dashboard after successful verification
  // Session is established by exchangeCodeForSession or verifyOtp
  // The setAll handler saves the session cookies to cookieStore, which Next.js will include in the response
  const redirectUrl = new URL(next, requestUrl.origin);
  // Remove country param from redirect URL
  redirectUrl.searchParams.delete("country");
  
  console.log("✅ Email verified and session established. Redirecting to:", redirectUrl.toString());
  
  // NextResponse.redirect will automatically include cookies set via cookieStore.set()
  // The Supabase session cookies are already saved by the setAll handler above
  return NextResponse.redirect(redirectUrl);
}

