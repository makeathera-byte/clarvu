import { logEvent } from "./logEvent";

/**
 * Log an error event to the usage_events table
 * @param user_id - User ID (can be null for system errors)
 * @param errorType - Type of error (e.g., "api_error", "ai_error", "database_error")
 * @param errorMessage - Error message or description
 */
export async function logError(
  user_id: string | null,
  errorType: string,
  errorMessage?: string
) {
  try {
    // Log as error event
    if (user_id) {
      await logEvent(user_id, errorType, undefined);
    } else {
      // For system errors without user_id, we need to use admin client
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      
      await supabase.from("usage_events").insert({
        user_id: null, // System error
        event: errorType,
        value: null,
        created_at: new Date().toISOString(),
      });
    }
    
    // Also log to console for debugging
    console.error(`[${errorType}]`, errorMessage || "Error occurred");
  } catch (error) {
    // Silently fail - don't break the app if error logging fails
    console.error("Failed to log error:", error);
  }
}

