/**
 * User utility functions
 * Common user/session fetching patterns
 */

import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

/**
 * Get authenticated user or throw error
 * Use in server actions and API routes
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { user, supabase };
}

/**
 * Get user display name for personalized greeting
 * Priority: user_metadata.name > email prefix > email
 */
export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) {
    return "there";
  }

  // First check user metadata
  const name = user.user_metadata?.name;
  if (name && typeof name === "string" && name.trim()) {
    return name.trim();
  }

  // Fallback to email prefix
  if (user.email) {
    const emailPrefix = user.email.split("@")[0];
    // Capitalize first letter
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }

  return "there";
}

/**
 * Get user settings with defaults
 */
export async function getUserSettingsWithDefaults() {
  try {
    const { user, supabase } = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found, which is fine
      throw error;
    }

    // Return with defaults
    return {
      reminder_interval: data?.reminder_interval ?? 30,
      notifications_enabled: data?.notifications_enabled ?? true,
      smart_reminders_enabled: data?.smart_reminders_enabled ?? true,
      min_reminder_interval_minutes: data?.min_reminder_interval_minutes ?? 20,
      max_reminder_interval_minutes: data?.max_reminder_interval_minutes ?? 45,
      quiet_hours_start: data?.quiet_hours_start ?? null,
      quiet_hours_end: data?.quiet_hours_end ?? null,
      reminder_mode: data?.reminder_mode ?? ("medium" as const),
      ...data,
    };
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      throw error;
    }
    // Return defaults on error
    return {
      reminder_interval: 30,
      notifications_enabled: true,
      smart_reminders_enabled: true,
      min_reminder_interval_minutes: 20,
      max_reminder_interval_minutes: 45,
      quiet_hours_start: null,
      quiet_hours_end: null,
      reminder_mode: "medium" as const,
    };
  }
}

