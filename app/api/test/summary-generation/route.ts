import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/responses";

/**
 * Test endpoint to manually trigger summary generation for the current user
 * Useful for testing and debugging
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserOrThrow();
    const supabase = await createClient();

    // Get user's AI summary time setting
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("ai_summary_time, notifications_enabled")
      .eq("user_id", user.id)
      .single();

    if (settingsError) {
      return errorResponse(
        `Error fetching settings: ${settingsError.message}`,
        500
      );
    }

    // Get today's logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: logs, error: logsError } = await supabase
      .from("activity_logs")
      .select("id")
      .eq("user_id", user.id)
      .gte("start_time", today.toISOString())
      .lt("start_time", tomorrow.toISOString());

    if (logsError) {
      return errorResponse(`Error fetching logs: ${logsError.message}`, 500);
    }

    // Check if summary already exists
    const dateStr = today.toISOString().split("T")[0];
    const { data: existingSummary } = await supabase
      .from("daily_summaries")
      .select("id, date, created_at")
      .eq("user_id", user.id)
      .eq("date", dateStr)
      .single();

    const currentTime = new Date();
    const [targetHour, targetMinute] = (settings?.ai_summary_time || "22:00")
      .split(":")
      .map(Number);
    
    const targetMinutes = targetHour * 60 + targetMinute;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    return successResponse({
      user_id: user.id,
      ai_summary_time: settings?.ai_summary_time || "22:00",
      current_time: currentTime.toISOString(),
      current_time_local: currentTime.toLocaleString(),
      target_minutes: targetMinutes,
      current_minutes: currentMinutes,
      is_time_passed: currentMinutes >= targetMinutes,
      logs_count: logs?.length || 0,
      has_existing_summary: !!existingSummary,
      existing_summary_date: existingSummary?.date || null,
      can_generate: currentMinutes >= targetMinutes && !existingSummary && (logs?.length || 0) > 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utc_offset: currentTime.getTimezoneOffset(),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || "Unknown error", 500);
  }
}

