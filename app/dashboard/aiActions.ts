"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDailySummary(date?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { summary: null, error: "Unauthorized" };
  }

  const targetDate = date || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_summaries")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", targetDate)
    .single();

  if (error) {
    // PGRST116 = not found, which is fine if summary doesn't exist yet
    if (error.code === "PGRST116") {
      return { summary: null, error: null };
    }

    console.error("Error fetching daily summary:", {
      message: error.message,
      code: error.code,
    });

    return { summary: null, error: error.message || "Unknown error occurred" };
  }

  return { summary: data, error: null };
}

export async function getYesterdaySummary() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { summary: null, error: "Unauthorized" };
  }

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = yesterday.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_summaries")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", targetDate)
    .single();

  if (error) {
    // PGRST116 = not found, which is fine
    if (error.code === "PGRST116") {
      return { summary: null, error: null };
    }

    console.error("Error fetching yesterday summary:", {
      message: error.message,
      code: error.code,
    });

    return { summary: null, error: error.message || "Unknown error occurred" };
  }

  return { summary: data, error: null };
}

export async function getWeeklySummary(weekStart?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { summary: null, error: "Unauthorized" };
  }

  let targetWeekStart = weekStart;

  if (!targetWeekStart) {
    // Get the most recent week start (last 7 days)
    const today = new Date();
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - 7);
    targetWeekStart = weekStartDate.toISOString().split("T")[0];
  }

  const { data, error } = await supabase
    .from("weekly_summaries")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", targetWeekStart)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { summary: null, error: null };
    }

    console.error("Error fetching weekly summary:", {
      message: error.message,
      code: error.code,
    });

    return { summary: null, error: error.message || "Unknown error occurred" };
  }

  return { summary: data, error: null };
}

export async function getMonthlySummary(month?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { summary: null, error: "Unauthorized" };
  }

  let targetMonth = month;

  if (!targetMonth) {
    // Get current month
    const today = new Date();
    targetMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  }

  const { data, error } = await supabase
    .from("monthly_summaries")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", targetMonth)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { summary: null, error: null };
    }

    console.error("Error fetching monthly summary:", {
      message: error.message,
      code: error.code,
    });

    return { summary: null, error: error.message || "Unknown error occurred" };
  }

  return { summary: data, error: null };
}

export async function getLatestSummaries() {
  const [daily, weekly, monthly] = await Promise.all([
    getDailySummary(),
    getWeeklySummary(),
    getMonthlySummary(),
  ]);

  return {
    daily: daily.summary,
    weekly: weekly.summary,
    monthly: monthly.summary,
    errors: {
      daily: daily.error,
      weekly: weekly.error,
      monthly: monthly.error,
    },
  };
}

