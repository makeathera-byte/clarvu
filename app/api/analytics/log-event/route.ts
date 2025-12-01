import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/analytics/logEvent";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { event } = await request.json();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Missing event" },
        { status: 400 }
      );
    }

    // Verify the user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Log the event
    try {
      await logEvent(user.id, event);
      console.log("✅ Logged event via API:", event, "for user:", user.id);
      return NextResponse.json({ success: true });
    } catch (logError: any) {
      console.error("❌ Error in logEvent call:", logError);
      // Still return success to not break the app
      return NextResponse.json({ 
        success: false, 
        error: logError.message 
      });
    }
  } catch (error: any) {
    console.error("❌ Error in log-event API:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

