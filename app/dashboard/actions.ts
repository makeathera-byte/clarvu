"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getTodayRangeUTC } from "@/lib/utils/date-timezone";

export async function startActivity(activity: string, categoryId: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .insert({
      user_id: user.id,
      activity,
      category_id: categoryId,
      start_time: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error starting activity:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    
    // If table doesn't exist, provide helpful error message
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      return { error: "Database tables not set up. Please run migrations in Supabase SQL Editor." };
    }
    
    return { error: error.message || "Unknown error occurred" };
  }

  revalidatePath("/dashboard");
  return { logId: data.id };
}

export async function endActivity(logId: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("activity_logs")
    .update({
      end_time: new Date().toISOString(),
    })
    .eq("id", logId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error ending activity:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTodayLogs() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { logs: [], error: "Unauthorized" };
  }

  // Get user's timezone from settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("timezone")
    .eq("user_id", user.id)
    .maybeSingle();

  const userTimezone = settings?.timezone || "UTC";
  
  // Get today's range in user's timezone (converted to UTC for database query)
  const { start, end } = getTodayRangeUTC(userTimezone);

  const { data, error } = await supabase
    .from("activity_logs")
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `)
    .eq("user_id", user.id)
    .gte("start_time", start.toISOString())
    .lt("start_time", end.toISOString())
    .order("start_time", { ascending: false });

  if (error) {
    console.error("Error fetching logs:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    
    // If table doesn't exist, return empty array gracefully
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn("activity_logs table may not exist. Please run the database migrations.");
      return { logs: [], error: "Database tables not set up. Please run migrations in Supabase." };
    }
    
    return { logs: [], error: error.message || "Unknown error occurred" };
  }

  return { logs: data || [] };
}

export async function getWeeklyLogs() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { logs: [], error: "Unauthorized" };
  }

  // Get user's timezone from settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("timezone")
    .eq("user_id", user.id)
    .maybeSingle();

  const userTimezone = settings?.timezone || "UTC";
  
  // Get today's start in user's timezone
  const { start: todayStart } = getTodayRangeUTC(userTimezone);
  
  // Get logs from the past 7 days (using timezone-aware dates)
  const weekStart = new Date(todayStart.getTime() - (7 * 24 * 60 * 60 * 1000));

  const { data, error } = await supabase
    .from("activity_logs")
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `)
    .eq("user_id", user.id)
    .gte("start_time", weekStart.toISOString())
    .lt("start_time", todayStart.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching weekly logs:", {
      message: error.message,
      code: error.code,
    });
    
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      return { logs: [], error: "Database tables not set up." };
    }
    
    return { logs: [], error: error.message || "Unknown error occurred" };
  }

  return { logs: data || [] };
}
