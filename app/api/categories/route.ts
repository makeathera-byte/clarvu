import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { createCategorySchema } from "@/lib/api/validation";

export async function GET() {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Create Supabase client
    const supabase = await createClient();

    // Fetch default categories (user_id is NULL) and user's custom categories
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("user_id", { ascending: true, nullsFirst: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      // Return empty array if table doesn't exist
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

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCategorySchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return errorResponse(
        firstError?.message || "Invalid request data",
        400
      );
    }

    const { name, color, icon, business_type } = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Check if category with same name already exists for this user
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name)
      .single();

    if (existing) {
      return errorResponse("Category with this name already exists", 409);
    }

    // Create new category
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name,
        color,
        icon: icon || null,
        business_type: business_type || "other",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return errorResponse(error.message || "Failed to create category", 500);
    }

    return successResponse(data, 201);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

