import { NextRequest, NextResponse } from "next/server";
import { getPreviousPeriodLogs } from "@/app/history/actions";

/**
 * GET /api/history/previous-period?start=YYYY-MM-DD&end=YYYY-MM-DD&days=N
 * Get logs for the previous period (for comparison)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const periodLengthDays = parseInt(searchParams.get("days") || "7", 10);

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const logs = await getPreviousPeriodLogs(startDate, endDate, periodLengthDays);

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Error fetching previous period logs:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

