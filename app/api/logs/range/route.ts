import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { rangeQuerySchema } from "@/lib/api/validation";

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // Validate query parameters
    const validationResult = rangeQuerySchema.safeParse({ start, end });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return errorResponse(
        firstError?.message || "Invalid date range",
        400
      );
    }

    const { start: startDate, end: endDate } = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Fetch logs in date range with category information
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
      .gte("start_time", startDate)
      .lt("start_time", endDate)
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching logs in range:", error);
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

