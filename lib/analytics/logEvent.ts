import { createAdminClient } from "@/lib/supabase/admin";

export async function logEvent(
  user_id: string,
  event: string,
  value?: number
) {
  try {
    // Use admin client to bypass RLS for server-side inserts
    const supabase = createAdminClient();
    
    const { data, error } = await supabase.from("usage_events").insert({
      user_id,
      event,
      value: value || null,
      created_at: new Date().toISOString(),
    }).select();
    
    if (error) {
      console.error("❌ Error logging event:", error);
      console.error("Event details:", { user_id, event, value, error_code: error.code, error_message: error.message });
      throw error; // Re-throw so callers can see the error
    } else {
      console.log("✅ Successfully logged event:", event, "for user:", user_id);
    }
  } catch (error) {
    // Log error but don't break the app
    console.error("❌ Error in logEvent function:", error);
    throw error; // Re-throw so callers can see what went wrong
  }
}

