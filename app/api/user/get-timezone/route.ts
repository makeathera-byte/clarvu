import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Get user's current timezone setting
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Handle authentication errors
    if (authError) {
      console.error("❌ Auth error in get-timezone:", authError);
      
      // If user doesn't exist in JWT, clear session and return error
      if (authError.message?.includes("does not exist") || authError.message?.includes("JWT")) {
        // Try to sign out to clear invalid session
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: "Session expired. Please log in again.",
            requiresLogin: true 
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Authentication error: ${authError.message}`,
          requiresLogin: true 
        },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized",
          requiresLogin: true 
        },
        { status: 401 }
      );
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("timezone, country")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      console.error("❌ Error fetching user settings:", settingsError);
    }

    let country = settings?.country || null;
    let timezone = settings?.timezone || "UTC";
    
    // If country is missing, try to get from signup_events and backfill
    if (!country || country === "unknown" || country === null || country === "") {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const { getTimezoneFromCountry } = await import("@/lib/utils/timezone");
        const adminClient = createAdminClient();
        
        const { data: signupEvent } = await adminClient
          .from("signup_events")
          .select("country")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (signupEvent?.country && signupEvent.country !== "unknown" && signupEvent.country !== null) {
          const normalizedCountry = String(signupEvent.country).toUpperCase().trim();
          if (normalizedCountry.length === 2) {
            country = normalizedCountry;
            timezone = getTimezoneFromCountry(normalizedCountry);
            
            console.log("📦 Backfilling country from signup_events:", country);
            
            // Save to user_settings
            const { error: updateError } = await adminClient
              .from("user_settings")
              .upsert({
                user_id: user.id,
                country: normalizedCountry,
                timezone,
              }, {
                onConflict: "user_id"
              });
            
            if (updateError) {
              console.error("❌ Error backfilling country:", updateError);
            } else {
              console.log("✅ Backfilled country to user_settings:", country);
            }
          }
        }
      } catch (backfillError) {
        console.error("❌ Error backfilling country in get-timezone:", backfillError);
      }
    }

    const response = {
      success: true,
      timezone,
      country,
    };
    
    console.log("📤 Returning settings for user:", user.id, response);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error getting timezone:", error);
    return NextResponse.json(
      { success: false, error: error.message, timezone: "UTC" },
      { status: 500 }
    );
  }
}

