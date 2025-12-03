import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow } from "@/lib/api/auth";
import { getDateRangeUTC } from "@/lib/utils/date-timezone";

/**
 * GET /api/history/logs-for-date?date=YYYY-MM-DD&timezone=America/New_York
 * Get logs for a specific date in the user's timezone
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserOrThrow();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const timezoneParam = searchParams.get("timezone");

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    // Get user's timezone from settings if not provided
    let userTimezone = timezoneParam || "UTC";
    if (!timezoneParam) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("timezone")
        .eq("user_id", user.id)
        .maybeSingle();
      
      userTimezone = settings?.timezone || "UTC";
    }

    // Get the date range in UTC for the specified date in the user's timezone
    const { start: startOfDay, end: endOfDay } = getDateRangeUTC(date, userTimezone);

    const { data, error } = await supabase
      .from("activity_logs")
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          business_type
        )
      `)
      .eq("user_id", user.id)
      .gte("start_time", startOfDay.toISOString())
      .lt("start_time", endOfDay.toISOString())
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching logs for date:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error: any) {
    console.error("Error in logs-for-date API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

