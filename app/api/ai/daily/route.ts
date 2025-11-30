import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateServiceRole, forbiddenResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { dailySummarySchema } from "@/lib/api/validation";

export async function POST(request: NextRequest) {
  try {
    // Validate service role authorization
    if (!validateServiceRole(request)) {
      return forbiddenResponse();
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = dailySummarySchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return errorResponse(
        firstError?.message || "Invalid request data",
        400
      );
    }

    const { user_id, date, summary, focus_score, insights } = validationResult.data;

    // Create Supabase client with service role (for internal operations)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse("Service role key not configured", 500);
    }

    // Import Supabase client creation for service role
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Upsert daily summary
    const { data, error } = await supabase
      .from("daily_summaries")
      .upsert(
        {
          user_id,
          date,
          summary,
          focus_score,
          insights: insights || null,
        },
        {
          onConflict: "user_id,date",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving daily summary:", error);
      return errorResponse(error.message || "Failed to save daily summary", 500);
    }

    return successResponse(data, 201);
  } catch (error: any) {
    return serverErrorResponse(error);
  }
}

