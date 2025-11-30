"use server";

import { createClient } from "@/lib/supabase/server";
import { DailySummary, WeeklySummary, MonthlySummary, ActivityLog } from "@/lib/types";

/**
 * Get daily summaries for history page (optimized)
 */
export async function getDailySummaries(limit: number = 30): Promise<DailySummary[]> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("daily_summaries")
    .select("id, user_id, date, summary, focus_score, created_at, updated_at")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching daily summaries:", error);
    return [];
  }

  return (data as DailySummary[]) || [];
}

/**
 * Get weekly summaries for history page (optimized)
 */
export async function getWeeklySummaries(limit: number = 12): Promise<WeeklySummary[]> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("weekly_summaries")
    .select("id, user_id, week_start, summary, insights, created_at, updated_at")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching weekly summaries:", error);
    return [];
  }

  return (data as WeeklySummary[]) || [];
}

/**
 * Get monthly summaries for history page (optimized)
 */
export async function getMonthlySummaries(limit: number = 6): Promise<MonthlySummary[]> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("monthly_summaries")
    .select("id, user_id, month, summary, insights, created_at, updated_at")
    .eq("user_id", user.id)
    .order("month", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching monthly summaries:", error);
    return [];
  }

  return (data as MonthlySummary[]) || [];
}

/**
 * Get past logs between start and end dates (optimized with selective fields)
 */
export async function getPastLogs(
  startDate: string,
  endDate: string
): Promise<ActivityLog[]> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select(`
      id,
      user_id,
      activity,
      start_time,
      end_time,
      category_id,
      created_at,
      updated_at,
      categories!inner (
        id,
        name,
        color,
        icon,
        business_type
      )
    `)
    .eq("user_id", user.id)
    .gte("start_time", startDate)
    .lte("start_time", endDate)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching past logs:", error);
    return [];
  }

  return (data as ActivityLog[]) || [];
}

/**
 * Get aggregated stats for a date range (optimized - single query)
 */
export async function getAggregatedStats(startDate: string, endDate: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // This would ideally use a database view or function, but for now we fetch minimal data
  const { data, error } = await supabase
    .from("activity_logs")
    .select(`
      start_time,
      end_time,
      categories!inner (
        business_type
      )
    `)
    .eq("user_id", user.id)
    .gte("start_time", startDate)
    .lte("start_time", endDate)
    .not("end_time", "is", null);

  if (error) {
    console.error("Error fetching aggregated stats:", error);
    return null;
  }

  // Calculate stats client-side (could be moved to DB function for better performance)
  let totalMinutes = 0;
  let revenueMinutes = 0;
  let adminMinutes = 0;

  data?.forEach((log: any) => {
    if (!log.start_time || !log.end_time) return;
    const start = new Date(log.start_time);
    const end = new Date(log.end_time);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    totalMinutes += duration;
    
    const businessType = log.categories?.business_type;
    if (businessType === "revenue") {
      revenueMinutes += duration;
    } else if (businessType === "admin") {
      adminMinutes += duration;
    }
  });

  return {
    totalHours: totalMinutes / 60,
    revenueHours: revenueMinutes / 60,
    adminHours: adminMinutes / 60,
    activityCount: data?.length || 0,
  };
}

/**
 * Get logs for a specific date (optimized)
 */
export async function getLogsForDate(date: string): Promise<ActivityLog[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return getPastLogs(startOfDay.toISOString(), endOfDay.toISOString());
}

/**
 * Get all categories for the user (including default/system categories)
 */
export async function getUserCategories() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Fetch default categories (user_id is NULL) and user's custom categories
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, color, icon, business_type")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("user_id", { ascending: true, nullsFirst: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get previous period logs for comparison (optimized)
 */
export async function getPreviousPeriodLogs(
  startDate: string,
  endDate: string,
  periodLengthDays: number
): Promise<ActivityLog[]> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const periodLength = end.getTime() - start.getTime();
  
  const previousEnd = new Date(start);
  previousEnd.setTime(previousEnd.getTime() - 1); // One day before start
  const previousStart = new Date(previousEnd);
  previousStart.setTime(previousStart.getTime() - periodLength);

  return getPastLogs(previousStart.toISOString(), previousEnd.toISOString());
}
