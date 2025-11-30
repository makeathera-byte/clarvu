"use server";

import { createClient } from "@/lib/supabase/server";
import { generateBusinessInsights } from "@/lib/insights/aggregateInsights";

export async function getBusinessInsights() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { insights: null, error: "Unauthorized" };
  }

  // Get today's logs with categories
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon,
        business_type
      )
    `)
    .eq("user_id", user.id)
    .gte("start_time", today.toISOString())
    .lt("start_time", tomorrow.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching logs for business insights:", {
      message: error.message,
      code: error.code,
    });

    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      return { insights: null, error: "Database tables not set up." };
    }

    return { insights: null, error: error.message || "Unknown error occurred" };
  }

  if (!logs || logs.length === 0) {
    // Return empty insights structure
    return {
      insights: {
        revenueTime: {
          total_revenue_minutes: 0,
          percentage_of_day_spent_on_revenue_work: 0,
        },
        adminTime: {
          total_admin_minutes: 0,
          admin_ratio: 0,
        },
        contextSwitches: 0,
        highImpactTasks: [],
        roiScore: {
          average_daily_roi_score: 0,
          roi_score_trend: 0,
        },
      },
      error: null,
    };
  }

  // Generate business insights from logs
  const insights = generateBusinessInsights(logs as any[]);

  return { insights, error: null };
}

