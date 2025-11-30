"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found, which is fine for first-time users
    console.error("Error fetching settings:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    
    // If table doesn't exist, return default settings gracefully
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn("user_settings table may not exist. Please run the database migrations.");
      return { settings: { reminder_interval: 30 }, error: "Using default settings. Please run migrations." };
    }
    
    return { error: error.message || "Unknown error occurred" };
  }

  // Return default if no settings exist
  if (!data) {
    return { settings: { reminder_interval: 30 } };
  }

  return { settings: data };
}

export async function updateReminderInterval(interval: number) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  if (![15, 30, 60].includes(interval)) {
    return { error: "Invalid interval. Must be 15, 30, or 60 minutes." };
  }

  // Check if settings exist
  const { data: existing } = await supabase
    .from("user_settings")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let result;
  if (existing) {
    // Update existing
    result = await supabase
      .from("user_settings")
      .update({ reminder_interval: interval })
      .eq("user_id", user.id)
      .select()
      .single();
  } else {
    // Insert new
    result = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        reminder_interval: interval,
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error("Error updating settings:", result.error);
    return { error: result.error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true, settings: result.data };
}

