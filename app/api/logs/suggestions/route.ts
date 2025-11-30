import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";

/**
 * Get activity suggestions based on user's previous activities
 * Returns unique activity names from user's history
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserOrThrow();
    const supabase = await createClient();

    // Get unique activity names from user's logs (last 100 logs)
    const { data: logs, error } = await supabase
      .from("activity_logs")
      .select("activity")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching activity suggestions:", error);
      return errorResponse(
        error.message || "Failed to fetch suggestions",
        500
      );
    }

    // Extract unique activity names
    const uniqueActivities = Array.from(
      new Set(
        (logs || [])
          .map((log) => log.activity?.trim())
          .filter((activity): activity is string => !!activity)
      )
    );

    // Sort by frequency (most used first), then alphabetically
    const activityCounts = new Map<string, number>();
    (logs || []).forEach((log) => {
      const activity = log.activity?.trim();
      if (activity) {
        activityCounts.set(activity, (activityCounts.get(activity) || 0) + 1);
      }
    });

    const sortedActivities = uniqueActivities.sort((a, b) => {
      const countA = activityCounts.get(a) || 0;
      const countB = activityCounts.get(b) || 0;
      if (countB !== countA) {
        return countB - countA; // Sort by frequency (descending)
      }
      return a.localeCompare(b); // Then alphabetically
    });

    return successResponse({ suggestions: sortedActivities });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

