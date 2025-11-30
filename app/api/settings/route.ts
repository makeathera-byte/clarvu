import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { updateSettingsSchema } from "@/lib/api/validation";

export async function GET() {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Create Supabase client
    const supabase = await createClient();

    // Fetch user settings
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // PGRST116 = not found, which is fine for first-time users
      if (error.code === "PGRST116") {
        // Return default settings
        return successResponse({
          reminder_interval: 30,
        });
      }

      console.error("Error fetching user settings:", error);
      
      // Return default settings if table doesn't exist
      if (error.code === "42P01") {
        return successResponse({
          reminder_interval: 30,
        });
      }
      
      throw error;
    }

    return successResponse(data || { reminder_interval: 30 });
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
    const validationResult = updateSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return errorResponse(
        firstError?.message || "Invalid request data",
        400
      );
    }

    const { reminder_interval } = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Upsert user settings
    const { data, error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          reminder_interval,
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating user settings:", error);
      return errorResponse(error.message || "Failed to update settings", 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

