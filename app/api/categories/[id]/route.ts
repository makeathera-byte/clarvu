import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid category ID");

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Get category ID from params
    const { id } = await params;
    
    // Validate UUID format
    const validationResult = uuidSchema.safeParse(id);
    if (!validationResult.success) {
      return errorResponse("Invalid category ID", 400);
    }

    // Create Supabase client
    const supabase = await createClient();

    // First, check if category exists and belongs to user
    const { data: category, error: fetchError } = await supabase
      .from("categories")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return errorResponse("Category not found", 404);
      }
      console.error("Error fetching category:", fetchError);
      return errorResponse(fetchError.message || "Failed to fetch category", 500);
    }

    // Check if category belongs to user (cannot delete default categories)
    if (!category.user_id || category.user_id !== user.id) {
      return errorResponse("Cannot delete default categories or categories owned by other users", 403);
    }

    // Check if category is being used in any activity logs
    const { data: logsUsingCategory, error: logsError } = await supabase
      .from("activity_logs")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (logsError) {
      console.error("Error checking category usage:", logsError);
    }

    if (logsUsingCategory && logsUsingCategory.length > 0) {
      return errorResponse(
        "Cannot delete category that is being used in activity logs",
        409
      );
    }

    // Delete the category
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting category:", deleteError);
      return errorResponse(deleteError.message || "Failed to delete category", 500);
    }

    return successResponse({ message: "Category deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

