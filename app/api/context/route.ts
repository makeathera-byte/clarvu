import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";

// Throttle: Store last log time per user (in-memory, resets on server restart)
const lastLogTime = new Map<string, number>();
const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * POST /api/context
 * Save context detection event for future AI pattern learning
 * Throttled: max 1 log per user per 5 minutes
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Check throttle
    const now = Date.now();
    const lastLog = lastLogTime.get(user.id);
    if (lastLog && now - lastLog < THROTTLE_MS) {
      return successResponse(
        { message: "Throttled - context logged recently" },
        200
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { context, confidence } = body;

    if (!context || typeof context !== "string") {
      return errorResponse("Context is required and must be a string", 400);
    }

    // Validate confidence if provided
    if (confidence !== undefined) {
      if (typeof confidence !== "number" || confidence < 0 || confidence > 100) {
        return errorResponse("Confidence must be a number between 0 and 100", 400);
      }
    }

    // Get Supabase client
    const supabase = await createClient();

    // Insert context log
    const { data, error } = await supabase
      .from("context_logs")
      .insert({
        user_id: user.id,
        context: context.trim(),
        confidence: confidence ?? null,
        detected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (throttle at DB level)
      if (error.code === "23505") {
        return successResponse(
          { message: "Throttled - context logged recently" },
          200
        );
      }

      console.error("Error saving context log:", error);
      if (error.code === "42P01") {
        return errorResponse("Database tables not set up", 500);
      }
      return errorResponse(error.message || "Failed to save context log", 500);
    }

    // Update throttle map
    lastLogTime.set(user.id, now);

    // Clean old entries from throttle map (older than 5 minutes)
    for (const [userId, timestamp] of lastLogTime.entries()) {
      if (now - timestamp > THROTTLE_MS) {
        lastLogTime.delete(userId);
      }
    }

    return successResponse({ log: data }, 201);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

