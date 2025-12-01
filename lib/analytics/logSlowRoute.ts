import { logEvent } from "./logEvent";

/**
 * Log a slow API route/event
 * @param user_id - User ID (can be null for system routes)
 * @param routeName - Name of the route/event (e.g., "api/generate-summary")
 * @param responseTimeMs - Response time in milliseconds
 */
export async function logSlowRoute(
  user_id: string | null,
  routeName: string,
  responseTimeMs: number
) {
  try {
    // Only log if response time is > 1000ms (1 second)
    if (responseTimeMs < 1000) {
      return;
    }

    if (user_id) {
      await logEvent(user_id, routeName, responseTimeMs);
    } else {
      // For system routes without user_id, use admin client
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      
      await supabase.from("usage_events").insert({
        user_id: null, // System route
        event: routeName,
        value: responseTimeMs,
        created_at: new Date().toISOString(),
      });
    }
    
    // Log warning for very slow routes (>5s)
    if (responseTimeMs > 5000) {
      console.warn(`[SLOW ROUTE] ${routeName} took ${responseTimeMs}ms`);
    }
  } catch (error) {
    // Silently fail - don't break the app if logging fails
    console.error("Failed to log slow route:", error);
  }
}

