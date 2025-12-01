import { NextRequest } from "next/server";
import { validateServiceRole, forbiddenResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { weeklySummarySchema } from "@/lib/api/validation";
import { logEvent } from "@/lib/analytics/logEvent";

export async function POST(request: NextRequest) {
  try {
    // Validate service role authorization
    if (!validateServiceRole(request)) {
      return forbiddenResponse();
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = weeklySummarySchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return errorResponse(
        firstError?.message || "Invalid request data",
        400
      );
    }

    const { user_id, week_start, summary, insights } = validationResult.data;

    // Create Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse("Service role key not configured", 500);
    }

    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Upsert weekly summary
    const { data, error } = await supabase
      .from("weekly_summaries")
      .upsert(
        {
          user_id,
          week_start,
          summary,
          insights: insights || null,
        },
        {
          onConflict: "user_id,week_start",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving weekly summary:", error);
      return errorResponse(error.message || "Failed to save weekly summary", 500);
    }

    // Log summary generation event
    try {
      await logEvent(user_id, "summary_generated");
      console.log("✅ Logged summary_generated event (weekly) for user:", user_id);
    } catch (logError) {
      console.error("❌ Error logging summary generation:", logError);
      // Don't fail the request if logging fails
    }

    return successResponse(data, 201);
  } catch (error: any) {
    return serverErrorResponse(error);
  }
}

