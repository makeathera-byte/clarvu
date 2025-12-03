import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow } from "@/lib/api/auth";

/**
 * GET /api/history/logs?start=ISO_DATE&end=ISO_DATE
 * Fetch activity logs for a date range
 * Note: start and end should be ISO date strings (UTC timestamps)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const user = await getUserOrThrow();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "start and end date parameters are required" },
        { status: 400 }
      );
    }

    // The dates should already be in UTC ISO format from the client
    // But we'll ensure they're properly formatted
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use ISO date strings." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("activity_logs")
      .select(`
        id,
        user_id,
        activity,
        start_time,
        end_time,
        category_id,
        created_at,
        updated_at,
        categories (
          id,
          name,
          color,
          icon,
          business_type
        )
      `)
      .eq("user_id", user.id)
      .gte("start_time", start.toISOString())
      .lte("start_time", end.toISOString())
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching logs:", error);
      return NextResponse.json(
        { error: "Failed to fetch logs", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      logs: data || [],
      count: data?.length || 0,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/history/logs:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

