import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { startLogSchema } from "@/lib/api/validation";

/**
 * Round a date to the nearest 30-minute block
 */
function roundTo30MinBlock(date: Date): Date {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const roundedMinutes = minutes < 30 ? 0 : 30;
  
  rounded.setMinutes(roundedMinutes, 0, 0);
  return rounded;
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = startLogSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return errorResponse(
        firstError?.message || "Invalid request data",
        400
      );
    }

    const { activity, category_id } = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Round to 30-minute block for consistent logging
    const now = new Date();
    const blockStart = roundTo30MinBlock(now);
    const blockEnd = new Date(blockStart);
    blockEnd.setMinutes(blockEnd.getMinutes() + 30);

    // Insert new activity log in current 30-minute block
    const { data, error } = await supabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        activity,
        category_id,
        start_time: blockStart.toISOString(),
        end_time: blockEnd.toISOString(), // Block-based: full 30-minute block
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating activity log:", error);
      return errorResponse(error.message || "Failed to create activity log", 500);
    }

    return successResponse(data, 201);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}
