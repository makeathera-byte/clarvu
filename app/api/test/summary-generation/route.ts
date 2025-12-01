import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Test endpoint to manually trigger summary generation for a specific user
 * This helps debug timezone and time checking issues
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Get user settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("ai_summary_time, timezone, notifications_enabled")
      .eq("user_id", userId)
      .single();

    if (!settings) {
      return NextResponse.json({ error: "User settings not found" }, { status: 404 });
    }

    // Call the Edge Function to generate summary
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(`${supabaseUrl}/functions/v1/daily-summary`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      userSettings: settings,
      edgeFunctionResult: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
