import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Test endpoint to verify summary time checking logic
 * This helps debug timezone issues
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const currentTimeUTC = new Date();

    // Get a test user's settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("user_id, ai_summary_time, timezone")
      .limit(1)
      .single();

    if (!settings) {
      return NextResponse.json({ error: "No user settings found" });
    }

    const userTimezone = settings.timezone || "UTC";
    const userTime = settings.ai_summary_time || "22:00";

    // Test timezone conversion
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: userTimezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(currentTimeUTC);
    const currentHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
    const currentMinute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");

    const [targetHour, targetMinute] = userTime.split(":").map(Number);
    const targetMinutes = targetHour * 60 + targetMinute;
    const currentMinutes = currentHour * 60 + currentMinute;
    const minutesSinceTarget = currentMinutes - targetMinutes;
    const shouldGenerate = minutesSinceTarget >= 0 && minutesSinceTarget < 60;

    return NextResponse.json({
      current_time_utc: currentTimeUTC.toISOString(),
      user_timezone: userTimezone,
      user_summary_time: userTime,
      current_time_in_user_tz: `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`,
      target_time: userTime,
      minutes_since_target: minutesSinceTarget,
      should_generate: shouldGenerate,
      explanation: shouldGenerate
        ? `Summary should generate - it's ${minutesSinceTarget} minutes past the target time`
        : `Summary should NOT generate - target time is ${Math.abs(minutesSinceTarget)} minutes away`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

