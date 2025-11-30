import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, serverErrorResponse } from "@/lib/api/responses";

export async function GET() {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Create Supabase client
    const supabase = await createClient();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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
      .gte("start_time", today.toISOString())
      .lt("start_time", tomorrow.toISOString())
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

