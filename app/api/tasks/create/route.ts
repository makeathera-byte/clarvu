import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { createTaskSchema } from "@/lib/api/validation";
import { logEvent } from "@/lib/analytics/logEvent";

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createTaskSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return errorResponse(
        firstError?.message || "Invalid request data",
        400
      );
    }

    const { activity, category_id, start_time, duration_minutes, startNow } = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Use current time if start_time not provided (for quick task creation)
    const startTimeDate = start_time ? new Date(start_time) : new Date();
    const now = new Date();
    const isFuture = startTimeDate.getTime() > now.getTime();

    // Determine status
    let status: "pending" | "in_progress" | "completed" | "scheduled" = "pending";
    if (startNow && !isFuture) {
      status = "in_progress";
    } else if (isFuture) {
      status = "scheduled";
    }

    // Calculate end time based on duration
    const endTime = new Date(startTimeDate);
    endTime.setMinutes(endTime.getMinutes() + duration_minutes);

    // Insert new task
    // Note: end_time is null for pending/in_progress/scheduled tasks
    // It will be set when task is completed
    const { data, error } = await supabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        activity,
        category_id,
        start_time: startTimeDate.toISOString(),
        end_time: null, // Tasks start without end_time
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return errorResponse(error.message || "Failed to create task", 500);
    }

    // Log usage event
    try {
      await logEvent(user.id, "task_created");
    } catch (logError) {
      console.error("Error logging event:", logError);
    }

    return successResponse(data, 201);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

