"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Get cached routine for today (if exists)
 * Does NOT trigger AI generation
 */
export async function getCachedRoutine() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { routine: null, error: "Unauthorized" };
  }

  // Get today's date in user's timezone (using UTC date string)
  const today = new Date();
  const todayDateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

  // Check if we have a cached routine for today
  let cachedRoutine = null;
  let error = null;

  try {
    const { data, error: queryError } = await supabase
      .from("routine_summaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayDateStr)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows

    if (queryError) {
      // Check if it's a "table doesn't exist" error or similar
      if (queryError.code === "42P01" || queryError.code === "PGRST116") {
        // Table doesn't exist or no rows - both are fine, just return null
        return { routine: null, error: null };
      }
      // Other errors - log but don't throw
      console.warn("Error fetching cached routine (non-critical):", queryError.code, queryError.message);
      return { routine: null, error: null }; // Return gracefully instead of error
    }

    cachedRoutine = data;
  } catch (err: any) {
    // Catch any unexpected errors
    console.warn("Unexpected error fetching cached routine (non-critical):", err?.message || err);
    return { routine: null, error: null }; // Return gracefully
  }

  if (cachedRoutine) {
    return {
      routine: {
        routine: cachedRoutine.routine,
        explanation: cachedRoutine.explanation,
        hasEnoughData: true,
        cached: true,
        cachedAt: cachedRoutine.created_at,
      },
      error: null,
    };
  }

  // No cached routine found
  return { routine: null, error: null };
}

/**
 * OLD FUNCTION - DO NOT USE
 * This was calling AI automatically on page load
 * @deprecated Use getCachedRoutine() instead
 */
export async function getRoutineDirect() {
  // Return empty routine to prevent auto-generation
  return {
    routine: null,
    error: "Routine generation must be triggered manually via API",
  };
}
