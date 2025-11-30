import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/responses";

/**
 * API endpoint to check if a new summary is ready
 * Used by frontend to trigger notifications
 * Supports: daily, weekly, monthly summaries
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserOrThrow();
    const supabase = await createClient();

    // Get summary type from query param (default: daily)
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "daily";

    let tableName: string;
    let dateField: string;
    let dateValue: string;

    if (type === "weekly") {
      tableName = "weekly_summaries";
      dateField = "week_start";
      // Get previous completed week start (last Monday)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const weekStart = new Date(today);
      
      if (dayOfWeek === 1) {
        // Today is Monday, get last Monday (7 days ago)
        weekStart.setDate(today.getDate() - 7);
      } else if (dayOfWeek === 0) {
        // Today is Sunday, get last Monday (6 days ago)
        weekStart.setDate(today.getDate() - 6);
      } else {
        // Any other day, calculate last Monday
        weekStart.setDate(today.getDate() - (dayOfWeek - 1) - 7);
      }
      weekStart.setHours(0, 0, 0, 0);
      dateValue = weekStart.toISOString().split("T")[0];
    } else if (type === "monthly") {
      tableName = "monthly_summaries";
      dateField = "month";
      // Get first day of previous month (since monthly summary is generated on 2nd of month for previous month)
      const today = new Date();
      const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      dateValue = previousMonthStart.toISOString().split("T")[0];
    } else {
      tableName = "daily_summaries";
      dateField = "date";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateValue = today.toISOString().split("T")[0];
    }

    const { data: summary, error } = await supabase
      .from(tableName)
      .select("id, created_at, updated_at")
      .eq("user_id", user.id)
      .eq(dateField, dateValue)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found
      return errorResponse(error.message || "Failed to check summary", 500);
    }

    // Check if summary was created/updated in the last 6 hours (likely just generated)
    // This gives a wider window for checking, accounting for:
    // - Daily summaries generated at user's ai_summary_time (could be late at night)
    // - Weekly summaries generated on Monday mornings
    // - Monthly summaries generated on the 2nd of the month
    // - Frontend checks every 5 minutes, so 6 hours ensures we catch all notifications
    const isNew = summary
      ? new Date().getTime() - new Date(summary.updated_at || summary.created_at).getTime() <
        6 * 60 * 60 * 1000 // 6 hours window
      : false;

    return successResponse({
      hasSummary: !!summary,
      isNew,
      date: dateValue,
      type,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || "Unknown error", 500);
  }
}

