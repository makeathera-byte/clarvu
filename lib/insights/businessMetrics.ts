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

type BusinessType = "revenue" | "admin" | "learning" | "personal" | "break" | "other";

/**
 * Calculate total revenue-generating time
 */
export function calculateRevenueTime(logs: ActivityLog[]) {
  if (logs.length === 0) {
    return {
      total_revenue_minutes: 0,
      percentage_of_day_spent_on_revenue_work: 0,
    };
  }

  let totalRevenueMinutes = 0;
  let totalDayMinutes = 0;

  logs.forEach((log) => {
    if (log.start_time && log.end_time) {
      const start = new Date(log.start_time).getTime();
      const end = new Date(log.end_time).getTime();
      const duration = Math.floor((end - start) / (1000 * 60)); // minutes

      totalDayMinutes += duration;

      const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
      
      if (businessType === "revenue") {
        totalRevenueMinutes += duration;
      }
    }
  });

  const percentage = totalDayMinutes > 0
    ? Math.round((totalRevenueMinutes / totalDayMinutes) * 100)
    : 0;

  return {
    total_revenue_minutes: totalRevenueMinutes,
    percentage_of_day_spent_on_revenue_work: percentage,
  };
}

/**
 * Calculate admin time
 */
export function calculateAdminTime(logs: ActivityLog[]) {
  if (logs.length === 0) {
    return {
      total_admin_minutes: 0,
      admin_ratio: 0,
    };
  }

  let totalAdminMinutes = 0;
  let totalWorkMinutes = 0;

  logs.forEach((log) => {
    if (log.start_time && log.end_time) {
      const start = new Date(log.start_time).getTime();
      const end = new Date(log.end_time).getTime();
      const duration = Math.floor((end - start) / (1000 * 60));

      const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
      
      if (businessType === "revenue" || businessType === "admin") {
        totalWorkMinutes += duration;
      }
      
      if (businessType === "admin") {
        totalAdminMinutes += duration;
      }
    }
  });

  const adminRatio = totalWorkMinutes > 0
    ? Math.round((totalAdminMinutes / totalWorkMinutes) * 100)
    : 0;

  return {
    total_admin_minutes: totalAdminMinutes,
    admin_ratio: adminRatio,
  };
}

/**
 * Calculate context switches
 * Definition: every change of category = 1 switch
 */
export function calculateContextSwitches(logs: ActivityLog[]): number {
  if (logs.length < 2) return 0;

  // Sort logs by start time
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  let contextSwitches = 0;
  let previousCategoryId: string | null = null;

  sortedLogs.forEach((log) => {
    const currentCategoryId = log.category_id || log.categories?.id || null;
    
    if (previousCategoryId !== null && currentCategoryId !== previousCategoryId) {
      contextSwitches++;
    }
    
    previousCategoryId = currentCategoryId;
  });

  return contextSwitches;
}

/**
 * Detect high-impact tasks
 * Criteria:
 * - Lasted longer than threshold (45 min)
 * - Occurred during peak focus hours (10am-1pm)
 * - Category is "revenue" or business_type is "revenue"
 */
export function calculateHighImpactTasks(
  logs: ActivityLog[],
  minDurationMinutes: number = 45
): ActivityLog[] {
  const highImpactTasks: ActivityLog[] = [];
  const peakStartHour = 10; // 10 AM
  const peakEndHour = 13; // 1 PM

  logs.forEach((log) => {
    if (!log.start_time || !log.end_time) return;

    const start = new Date(log.start_time);
    const end = new Date(log.end_time);
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    const hour = start.getHours();

    const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
    const isRevenueCategory = businessType === "revenue";
    const isInPeakHours = hour >= peakStartHour && hour < peakEndHour;
    const meetsDurationThreshold = duration >= minDurationMinutes;

    if (isRevenueCategory && isInPeakHours && meetsDurationThreshold) {
      highImpactTasks.push(log);
    }
  });

  // Sort by duration (longest first)
  highImpactTasks.sort((a, b) => {
    if (!a.start_time || !a.end_time || !b.start_time || !b.end_time) return 0;
    const durationA = new Date(a.end_time).getTime() - new Date(a.start_time).getTime();
    const durationB = new Date(b.end_time).getTime() - new Date(b.start_time).getTime();
    return durationB - durationA;
  });

  return highImpactTasks;
}

/**
 * Calculate Task ROI Score
 * Scoring:
 * - revenue categories: +2
 * - admin: 0
 * - personal: +1
 * - break: 0
 * - waste: -2
 * - learning: +1
 */
export function calculateTaskROIScore(logs: ActivityLog[]) {
  if (logs.length === 0) {
    return {
      average_daily_roi_score: 0,
      roi_score_trend: 0, // placeholder
    };
  }

  let totalROI = 0;
  let taskCount = 0;

  logs.forEach((log) => {
    const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
    
    let score = 0;
    switch (businessType) {
      case "revenue":
        score = 2;
        break;
      case "admin":
        score = 0;
        break;
      case "personal":
        score = 1;
        break;
      case "break":
        score = 0;
        break;
      case "learning":
        score = 1;
        break;
      case "other":
      default:
        score = -2; // waste
        break;
    }

    totalROI += score;
    taskCount++;
  });

  const averageScore = taskCount > 0 ? totalROI / taskCount : 0;
  
  // Convert to 0-100 scale (assuming -2 to +2 range, map to 0-100)
  const normalizedScore = Math.max(0, Math.min(100, ((averageScore + 2) / 4) * 100));

  return {
    average_daily_roi_score: Math.round(normalizedScore),
    roi_score_trend: 0, // Placeholder for future 7-day trend calculation
  };
}

/**
 * Detect real-time context switch
 * Compares previous context with new context to detect task changes
 */
export function detectRealTimeContextSwitch(
  prevContext: { task: string | null; category: string | null } | null,
  newContext: { task: string | null; category: string | null }
): { isSwitch: boolean; from?: string; to?: string } {
  if (!prevContext) {
    return { isSwitch: false };
  }

  const prevTask = prevContext.task?.toLowerCase().trim();
  const newTask = newContext.task?.toLowerCase().trim();

  // Same task = no switch
  if (prevTask && newTask && prevTask === newTask) {
    return { isSwitch: false };
  }

  // Different tasks = switch detected
  if (prevTask && newTask && prevTask !== newTask) {
    return {
      isSwitch: true,
      from: prevContext.task || undefined,
      to: newContext.task || undefined,
    };
  }

  // Category change can also indicate switch
  if (prevContext.category && newContext.category && prevContext.category !== newContext.category) {
    return {
      isSwitch: true,
      from: prevContext.category || undefined,
      to: newContext.category || undefined,
    };
  }

  return { isSwitch: false };
}

/**
 * Infer business type from category name (fallback)
 */
function inferBusinessType(categoryName: string | null | undefined): BusinessType {
  if (!categoryName) return "other";

  const name = categoryName.toLowerCase();
  
  if (name.includes("work") || name.includes("deep")) {
    return "revenue";
  }
  if (name.includes("admin") || name.includes("administrative")) {
    return "admin";
  }
  if (name.includes("personal")) {
    return "personal";
  }
  if (name.includes("break") || name.includes("rest")) {
    return "break";
  }
  if (name.includes("learn") || name.includes("study")) {
    return "learning";
  }
  if (name.includes("waste")) {
    return "other";
  }
  
  return "other";
}

