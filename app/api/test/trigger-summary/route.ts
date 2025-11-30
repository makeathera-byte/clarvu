import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/responses";

/**
 * Manually trigger summary generation for the current user
 * Bypasses time check for testing purposes
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserOrThrow();

    // Call the Edge Function directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse("Server configuration error", 500);
    }

    // Trigger the Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/daily-summary`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test_user_id: user.id }), // Pass user ID for testing
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return errorResponse(
        data.error || "Failed to trigger summary generation",
        response.status
      );
    }

    return successResponse({
      message: "Summary generation triggered",
      response: data,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || "Unknown error", 500);
  }
}

