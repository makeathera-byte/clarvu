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
    // First try to get today's routine
    let result = await supabase
      .from("routine_summaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayDateStr)
      .maybeSingle();

    if (result.error) {
      // Check if it's a "table doesn't exist" or schema cache error
      if (result.error.code === "42P01" || 
          result.error.message?.includes("schema cache") || 
          result.error.message?.includes("Could not find the table")) {
        // Table doesn't exist or cache issue - return null gracefully
        console.warn("routine_summaries table not accessible:", result.error.message);
        return { routine: null, error: null };
      }
      // PGRST116 = no rows found, which is fine
      if (result.error.code === "PGRST116") {
        // Try to get the most recent routine instead
        console.log("No routine for today, checking for most recent routine...");
        const recentResult = await supabase
          .from("routine_summaries")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!recentResult.error && recentResult.data) {
          const recentDate = recentResult.data.date;
          const recentDateStr = typeof recentDate === 'string' ? recentDate : new Date(recentDate).toISOString().split("T")[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayDateStr = yesterday.toISOString().split("T")[0];
          
          // Use recent routine if it's from today or yesterday
          if (recentDateStr === todayDateStr || recentDateStr === yesterdayDateStr) {
            console.log("✅ Using most recent routine:", recentDateStr);
            cachedRoutine = recentResult.data;
          }
        }
        
        if (!cachedRoutine) {
          return { routine: null, error: null };
        }
      } else {
        // Other errors - log but don't throw
        console.warn("Error fetching cached routine (non-critical):", result.error.code, result.error.message);
        return { routine: null, error: null };
      }
    } else if (result.data) {
      cachedRoutine = result.data;
      console.log("✅ Found routine for today in server action");
    }
  } catch (err: any) {
    // Catch any unexpected errors
    if (err.message?.includes("schema cache") || err.message?.includes("Could not find the table")) {
      console.warn("Schema cache issue when fetching routine:", err.message);
    } else {
      console.warn("Unexpected error fetching cached routine (non-critical):", err?.message || err);
    }
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
