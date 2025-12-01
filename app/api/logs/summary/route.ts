import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";

/**
 * GET /api/logs/summary
 * Get a lightweight summary of today's logs for reminder system
 */
export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Get Supabase client
    const supabase = await createClient();

    // Get user's timezone from settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("timezone")
      .eq("user_id", user.id)
      .maybeSingle();

    const userTimezone = settings?.timezone || "UTC";
    
    // Get today's date range in user's timezone (converted to UTC for database query)
    const { getTodayRangeUTC } = await import("@/lib/utils/date-timezone");
    const { start, end } = getTodayRangeUTC(userTimezone);

    // Fetch today's logs
    const { data: logs, error: logsError } = await supabase
      .from("activity_logs")
      .select("id, activity, start_time, end_time, category_id, categories(name)")
      .eq("user_id", user.id)
      .gte("start_time", start.toISOString())
      .lt("start_time", end.toISOString())
      .order("start_time", { ascending: false });

    if (logsError) {
      console.error("Error fetching logs summary:", logsError);
      if (logsError.code === "42P01") {
        return errorResponse("Database tables not set up", 500);
      }
      return errorResponse(logsError.message || "Failed to fetch logs", 500);
    }

    // Calculate summary
    const logsArray = logs || [];
    const lastLog = logsArray[0] || null; // Most recent log
    
    const lastLogTime = lastLog?.start_time ? new Date(lastLog.start_time) : null;
    const logsTodayCount = logsArray.length;
    const lastActivity = lastLog?.activity || null;
    const lastCategory = lastLog?.categories?.name || null;
    const lastCategoryId = lastLog?.category_id || null;

    return successResponse({
      lastLogTime: lastLogTime?.toISOString() || null,
      logsTodayCount,
      lastActivity,
      lastCategory,
      lastCategoryId,
      hasLogsToday: logsTodayCount > 0,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

