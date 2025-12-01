import { createAdminClient } from "@/lib/supabase/admin";

export async function logVisit(data: {
  user_id?: string | null;
  path: string;
  device: string;
  country: string;
}) {
  try {
    // Use admin client to bypass RLS for server-side inserts
    const supabase = createAdminClient();
    
    const { error } = await supabase.from("visits").insert({
      user_id: data.user_id || null,
      path: data.path,
      device: data.device,
      country: data.country,
      visited_at: new Date().toISOString(),
    });
    
    if (error) {
      console.error("Error logging visit:", error);
    }
  } catch (error) {
    // Silently fail - don't break the app if logging fails
    console.error("Error logging visit:", error);
  }
}

