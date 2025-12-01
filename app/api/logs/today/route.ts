import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, serverErrorResponse } from "@/lib/api/responses";
import { getTodayRangeUTC } from "@/lib/utils/date-timezone";

export async function GET() {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Create Supabase client
    const supabase = await createClient();

    // Get user's timezone from settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("timezone")
      .eq("user_id", user.id)
      .maybeSingle();

    const userTimezone = settings?.timezone || "UTC";
    
    // Get today's date range in user's timezone (converted to UTC for database query)
    const { start, end } = getTodayRangeUTC(userTimezone);

    // Fetch today's logs with category information
    const { data, error } = await supabase
      .from("activity_logs")
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq("user_id", user.id)
      .gte("start_time", start.toISOString())
      .lt("start_time", end.toISOString())
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching today's logs:", error);
      // Return empty array instead of error if table doesn't exist
      if (error.code === "42P01") {
        return successResponse([]);
      }
      throw error;
    }

    return successResponse(data || []);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

