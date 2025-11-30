import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { endLogSchema } from "@/lib/api/validation";

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = endLogSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return errorResponse(
        firstError?.message || "Invalid request data",
        400
      );
    }

    const { logId } = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Update activity log with end time
    const { data, error } = await supabase
      .from("activity_logs")
      .update({
        end_time: new Date().toISOString(),
      })
      .eq("id", logId)
      .eq("user_id", user.id) // Ensure user owns this log
      .select()
      .single();

    if (error) {
      console.error("Error ending activity log:", error);
      
      // Check if log doesn't exist or doesn't belong to user
      if (error.code === "PGRST116") {
        return errorResponse("Activity log not found", 404);
      }
      
      return errorResponse(error.message || "Failed to end activity log", 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

