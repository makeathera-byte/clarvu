import { NextRequest, NextResponse } from "next/server";
import { logSignup } from "@/lib/analytics/logSignup";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { user_id, email, country } = await request.json();

    if (!user_id || !email) {
      return NextResponse.json(
        { success: false, error: "Missing user_id or email" },
        { status: 400 }
      );
    }

    // Use admin client to verify user exists and log signup
    const supabase = createAdminClient();
    
    // Verify the user exists in auth.users (using admin client to bypass RLS)
    try {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);

      if (userError || !userData?.user) {
        console.error("User not found or error:", userError);
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      // Verify email matches (security check)
      if (userData.user.email && userData.user.email !== email) {
        console.warn("Email mismatch:", userData.user.email, "vs", email);
        // Still allow logging, but use the email from auth.users
        const correctEmail = userData.user.email;
        
        // Check if signup already logged (prevent duplicates)
        const { data: existing } = await supabase
          .from("signup_events")
          .select("id")
          .eq("user_id", user_id)
          .single();

        if (existing) {
          return NextResponse.json({ success: true, message: "Already logged" });
        }

        // Log the signup with correct email
        await logSignup(user_id, correctEmail, country);
        return NextResponse.json({ success: true });
      }
    } catch (adminError: any) {
      // If admin API fails, still try to log (might be a new user)
      console.warn("Admin API error, proceeding with signup log:", adminError);
    }

    // Check if signup already logged (prevent duplicates)
    const { data: existing } = await supabase
      .from("signup_events")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (existing) {
      // Already logged, return success
      return NextResponse.json({ success: true, message: "Already logged" });
    }

    // Log the signup (using admin client to bypass RLS)
    try {
      await logSignup(user_id, email, country);
      console.log("✅ Signup logged via API:", email, country ? `(country: ${country})` : "");
      return NextResponse.json({ success: true });
    } catch (logError: any) {
      console.error("❌ Error in logSignup call:", logError);
      // Still return success to not block signup flow
      return NextResponse.json({ 
        success: false, 
        error: logError.message,
        logged: false 
      });
    }
  } catch (error: any) {
    console.error("❌ Error in log-signup API:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

