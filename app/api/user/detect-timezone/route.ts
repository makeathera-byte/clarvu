import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserTimezone, getTimezoneFromCountry } from "@/lib/utils/timezone";
import { getCountryFromRequest } from "@/lib/analytics/getCountryFromRequest";

/**
 * Detect and save user's timezone
 * Called on signup/login to automatically set timezone
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Handle authentication errors
    if (authError) {
      console.error("❌ Auth error in detect-timezone:", authError);
      
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
      console.error("No user found in detect-timezone route");
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized - Please log in again",
          requiresLogin: true 
        },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json().catch(() => ({}));
    const autoUpdate = body.autoUpdate || false;
    
    // Get country and normalize it
    let country = body.country;
    if (country) {
      country = String(country).trim();
      if (country === "" || country === "unknown" || country === "null") {
        country = undefined;
      } else {
        country = country.toUpperCase();
      }
    }
    
    console.log("📥 Received country in API:", body.country, "Normalized:", country);
    
    // IMPORTANT: If country is provided, ALWAYS derive timezone from country
    // This ensures timezone stays in sync with country
    let timezone: string;
    if (country && typeof country === "string" && country.length === 2) {
      // Country provided - derive timezone from country
      timezone = getTimezoneFromCountry(country);
      console.log("🌍 Derived timezone from country:", country, "->", timezone);
    } else {
      // No country provided - try to get timezone from request body
      timezone = body.timezone;
      
      // If not provided, try to detect from IP
      if (!timezone) {
        const countryFromIp = await getCountryFromRequest(request);
        if (countryFromIp && countryFromIp !== "unknown") {
          timezone = getTimezoneFromCountry(countryFromIp);
          console.log("🌍 Derived timezone from IP country:", countryFromIp, "->", timezone);
        }
      }
      
      // Fallback to UTC
      if (!timezone || timezone === "UTC") {
        timezone = "UTC";
      }
    }

    // Update user settings with timezone
    const { data: existing } = await supabase
      .from("user_settings")
      .select("id, timezone, country")
      .eq("user_id", user.id)
      .maybeSingle();
    
    console.log("📋 Existing settings:", existing);

    // Build updates object
    const updates: { timezone: string; country?: string } = { timezone };
    
    // Add country to updates if provided and valid (always save country if provided)
    if (country && typeof country === "string" && country.length === 2) {
      updates.country = country;
      console.log("💾 Including country in update:", country);
    } else if (country) {
      console.log("⚠️ Country provided but invalid format. Country value:", country, "Type:", typeof country);
    } else {
      console.log("⚠️ No country provided in request");
    }
    
    // Determine if we need to update
    // Always update if:
    // 1. autoUpdate is true (automatic detection)
    // 2. No existing settings
    // 3. Timezone is not set or is UTC
    // 4. Timezone is different
    // 5. Country is provided and different from existing (or existing is null/empty)
    const existingCountry = existing?.country || null;
    const countryChanged = country && (
      !existingCountry || 
      existingCountry.toUpperCase().trim() !== country.toUpperCase().trim()
    );
    
    const shouldUpdate = autoUpdate || 
      !existing || 
      !existing.timezone || 
      existing.timezone === "UTC" || 
      existing.timezone !== timezone || 
      countryChanged;
    
    console.log("🔍 Update check:", {
      autoUpdate,
      hasExisting: !!existing,
      timezoneMatch: existing?.timezone === timezone,
      countryChanged,
      existingCountry,
      newCountry: country,
      shouldUpdate
    });
    
    if (!shouldUpdate && existing?.timezone === timezone && (!country || existingCountry === country)) {
      // Timezone and country already set and match, no update needed
      console.log("✅ Settings already up to date, no update needed");
      return NextResponse.json({ 
        success: true, 
        timezone, 
        country: existingCountry || null, 
        message: "Settings already set" 
      });
    }

    if (existing) {
      console.log("🔄 Updating existing user_settings with:", updates);
      const { error: updateError, data: updatedData } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", user.id)
        .select("country, timezone")
        .single();
      
      if (updateError) {
        console.error("❌ Error updating timezone/country:", updateError);
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }
      console.log("✅ Updated user_settings:", updatedData);
      
      return NextResponse.json({ 
        success: true, 
        timezone: updatedData.timezone,
        country: updatedData.country || null 
      });
    } else {
      console.log("➕ Inserting new user_settings with:", updates);
      const { error: insertError, data: insertedData } = await supabase
        .from("user_settings")
        .insert({
          user_id: user.id,
          ...updates,
        })
        .select("country, timezone")
        .single();
      
      if (insertError) {
        console.error("❌ Error inserting timezone/country:", insertError);
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }
      console.log("✅ Inserted user_settings:", insertedData);
      
      return NextResponse.json({ 
        success: true, 
        timezone: insertedData.timezone,
        country: insertedData.country || null 
      });
    }
  } catch (error: any) {
    console.error("Error detecting timezone:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

