"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ReminderSettings {
  notifications_enabled?: boolean;
  smart_reminders_enabled?: boolean;
  min_reminder_interval_minutes?: number;
  max_reminder_interval_minutes?: number;
  quiet_hours_start?: string | null; // "HH:mm" format
  quiet_hours_end?: string | null; // "HH:mm" format
  reminder_mode?: "low" | "medium" | "high";
}

/**
 * Update reminder settings
 */
export async function updateReminderSettings(settings: ReminderSettings) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Map reminder_mode to min/max if provided
  let minInterval = settings.min_reminder_interval_minutes;
  let maxInterval = settings.max_reminder_interval_minutes;

  if (settings.reminder_mode) {
    const presets = {
      low: { min: 30, max: 60 },
      medium: { min: 20, max: 45 },
      high: { min: 15, max: 30 },
    };
    const preset = presets[settings.reminder_mode];
    if (preset) {
      minInterval = preset.min;
      maxInterval = preset.max;
    }
  }

  // Build update object
  const updates: any = {};

  if (settings.notifications_enabled !== undefined) {
    updates.notifications_enabled = settings.notifications_enabled;
  }
  if (settings.smart_reminders_enabled !== undefined) {
    updates.smart_reminders_enabled = settings.smart_reminders_enabled;
  }
  if (minInterval !== undefined) {
    updates.min_reminder_interval_minutes = minInterval;
  }
  if (maxInterval !== undefined) {
    updates.max_reminder_interval_minutes = maxInterval;
  }
  if (settings.quiet_hours_start !== undefined) {
    updates.quiet_hours_start = settings.quiet_hours_start;
  }
  if (settings.quiet_hours_end !== undefined) {
    updates.quiet_hours_end = settings.quiet_hours_end;
  }
  if (settings.reminder_mode !== undefined) {
    updates.reminder_mode = settings.reminder_mode;
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
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();
  } else {
    // Insert new
    result = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        ...updates,
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error("Error updating reminder settings:", result.error);
    return { error: result.error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true, settings: result.data };
}

/**
 * Update AI summary time setting
 */
export async function updateAISummaryTime(time: string | null) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Validate time format (HH:mm)
  // Normalize the time string - remove any whitespace and ensure proper format
  const normalizedTime = time?.trim();
  
  if (normalizedTime) {
    // Check if it's in HH:mm format (with or without seconds)
    const timeMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!timeMatch) {
      return { error: "Invalid time format. Use HH:mm format." };
    }
    
    // Extract hours and minutes
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    
    // Validate hours (0-23) and minutes (0-59)
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return { error: "Invalid time format. Use HH:mm format." };
    }
    
    // Normalize to HH:mm format
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    
    // Use the normalized time
    time = formattedTime;
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
      .update({ ai_summary_time: time || "22:00" })
      .eq("user_id", user.id)
      .select()
      .single();
  } else {
    // Insert new
    result = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        ai_summary_time: time || "22:00",
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error("Error updating AI summary time:", result.error);
    return { error: result.error.message };
  }

  revalidatePath("/settings");
  return { success: true, settings: result.data };
}

/**
 * Update theme preference
 */
export async function updateThemePreference(theme: "light" | "dark" | "system") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Validate theme value
  if (!["light", "dark", "system"].includes(theme)) {
    return { error: "Invalid theme. Must be 'light', 'dark', or 'system'." };
  }

  // Check if settings exist
  const { data: existing } = await supabase
    .from("user_settings")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let result;
  if (existing) {
    // Update existing
    result = await supabase
      .from("user_settings")
      .update({ theme })
      .eq("user_id", user.id)
      .select()
      .single();
  } else {
    // Insert new
    result = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        theme,
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error("Error updating theme preference:", result.error);
    return { error: result.error.message };
  }

  revalidatePath("/settings");
  return { success: true, settings: result.data };
}

