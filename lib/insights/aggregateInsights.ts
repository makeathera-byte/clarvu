import {
  calculateRevenueTime,
  calculateAdminTime,
  calculateContextSwitches,
  calculateHighImpactTasks,
  calculateTaskROIScore,
} from "./businessMetrics";

interface ActivityLog {
  id: string;
  activity: string;
  start_time: string;
  end_time: string | null;
  category_id: string | null;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
    business_type?: "revenue" | "admin" | "learning" | "personal" | "break" | "other" | null;
  } | null | any; // Flexible to handle Supabase response variations
}

export interface BusinessInsights {
  revenueTime: {
    total_revenue_minutes: number;
    percentage_of_day_spent_on_revenue_work: number;
  };
  adminTime: {
    total_admin_minutes: number;
    admin_ratio: number;
  };
  contextSwitches: number;
  highImpactTasks: ActivityLog[];
  roiScore: {
    average_daily_roi_score: number;
    roi_score_trend: number;
  };
}

/**
 * Generate comprehensive business insights from activity logs
 * This aggregates all business metrics into a single object
 */
export function generateBusinessInsights(logs: ActivityLog[] | any[]): BusinessInsights {
  // Cast logs to handle Supabase response variations
  const typedLogs = logs as ActivityLog[];
  
  return {
    revenueTime: calculateRevenueTime(typedLogs),
    adminTime: calculateAdminTime(typedLogs),
    contextSwitches: calculateContextSwitches(typedLogs),
    highImpactTasks: calculateHighImpactTasks(typedLogs),
    roiScore: calculateTaskROIScore(typedLogs),
  };
}

