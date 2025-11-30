import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";

/**
 * Update the start_time and/or end_time of an activity log
 * Supports adjusting time by minutes (positive or negative)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserOrThrow();
    const { id: logId } = await params;

    // Parse request body
    const body = await request.json();
    const { 
      adjust_start_minutes, 
      adjust_end_minutes,
      new_start_time,
      new_end_time 
    } = body;

    // Validate that at least one update method is provided
    if (
      adjust_start_minutes === undefined && 
      adjust_end_minutes === undefined &&
      !new_start_time &&
      !new_end_time
    ) {
      return errorResponse(
        "Must provide adjust_start_minutes, adjust_end_minutes, new_start_time, or new_end_time",
        400
      );
    }

    const supabase = await createClient();

    // Validate logId format (should be UUID)
    if (!logId || typeof logId !== "string") {
      return errorResponse("Invalid log ID format", 400);
    }

    // First, check if log exists (without user_id filter first to see if it exists at all)
    const { data: logCheck, error: checkError } = await supabase
      .from("activity_logs")
      .select("id, user_id")
      .eq("id", logId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking activity log:", checkError);
      return errorResponse(
        checkError.message || "Failed to check activity log",
        500
      );
    }

    // If log doesn't exist at all
    if (!logCheck) {
      console.error(`Log not found. LogId: ${logId}`);
      return errorResponse(
        "Activity log not found",
        404
      );
    }

    // Check if log belongs to current user
    if (logCheck.user_id !== user.id) {
      console.error(`Permission denied. LogId: ${logId}, LogUserId: ${logCheck.user_id}, CurrentUserId: ${user.id}`);
      return errorResponse(
        "You don't have permission to edit this activity log",
        403
      );
    }

    // Now fetch the full log data with times
    const { data: currentLog, error: fetchError } = await supabase
      .from("activity_logs")
      .select("id, user_id, start_time, end_time")
      .eq("id", logId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !currentLog) {
      console.error("Error fetching activity log details:", fetchError);
      return errorResponse(
        fetchError?.message || "Failed to fetch activity log details",
        500
      );
    }

    // Calculate new times
    let newStartTime = new Date(currentLog.start_time);
    let newEndTime = currentLog.end_time ? new Date(currentLog.end_time) : null;

    // Adjust start time
    if (adjust_start_minutes !== undefined) {
      newStartTime = new Date(newStartTime.getTime() + adjust_start_minutes * 60 * 1000);
    } else if (new_start_time) {
      newStartTime = new Date(new_start_time);
    }

    // Adjust end time
    if (adjust_end_minutes !== undefined && newEndTime) {
      newEndTime = new Date(newEndTime.getTime() + adjust_end_minutes * 60 * 1000);
    } else if (new_end_time) {
      newEndTime = new Date(new_end_time);
    }

    // Validate: end_time should be after start_time
    if (newEndTime && newEndTime <= newStartTime) {
      return errorResponse(
        "End time must be after start time",
        400
      );
    }

    // Validate: times should be within reasonable bounds (not too far in past/future)
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const oneWeekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (newStartTime < oneYearAgo || newStartTime > oneWeekAhead) {
      return errorResponse(
        "Start time must be within the last year and not more than a week in the future",
        400
      );
    }

    if (newEndTime && (newEndTime < oneYearAgo || newEndTime > oneWeekAhead)) {
      return errorResponse(
        "End time must be within the last year and not more than a week in the future",
        400
      );
    }

    // Update the log
    const updateData: { start_time: string; end_time?: string | null } = {
      start_time: newStartTime.toISOString(),
    };

    if (newEndTime) {
      updateData.end_time = newEndTime.toISOString();
    } else if (new_end_time === null) {
      // Explicitly set to null if provided
      updateData.end_time = null;
    }

    const { data: updatedLog, error: updateError } = await supabase
      .from("activity_logs")
      .update(updateData)
      .eq("id", logId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating activity log time:", updateError);
      return errorResponse(
        updateError.message || "Failed to update activity log time",
        500
      );
    }

    return successResponse(updatedLog);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

