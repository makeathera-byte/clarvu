import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";

/**
 * Delete an activity log
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserOrThrow();
    const { id: logId } = await params;

    if (!logId || typeof logId !== "string") {
      return errorResponse("Invalid log ID format", 400);
    }

    const supabase = await createClient();

    // First, verify ownership
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

    if (!logCheck) {
      return errorResponse("Activity log not found", 404);
    }

    if (logCheck.user_id !== user.id) {
      return errorResponse(
        "You don't have permission to delete this activity log",
        403
      );
    }

    // Delete the log
    const { error: deleteError } = await supabase
      .from("activity_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting activity log:", deleteError);
      return errorResponse(
        deleteError.message || "Failed to delete activity log",
        500
      );
    }

    return successResponse({ message: "Activity log deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

/**
 * Update activity log (activity name, category)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserOrThrow();
    const { id: logId } = await params;

    if (!logId || typeof logId !== "string") {
      return errorResponse("Invalid log ID format", 400);
    }

    const body = await request.json();
    const { activity, category_id } = body;

    if (!activity && !category_id) {
      return errorResponse("Must provide activity or category_id to update", 400);
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: logCheck } = await supabase
      .from("activity_logs")
      .select("id, user_id")
      .eq("id", logId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!logCheck) {
      return errorResponse("Activity log not found", 404);
    }

    // Build update object
    const updateData: { activity?: string; category_id?: string | null } = {};
    if (activity !== undefined) updateData.activity = activity;
    if (category_id !== undefined) updateData.category_id = category_id || null;

    // Update the log
    const { data: updatedLog, error: updateError } = await supabase
      .from("activity_logs")
      .update(updateData)
      .eq("id", logId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating activity log:", updateError);
      return errorResponse(
        updateError.message || "Failed to update activity log",
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

