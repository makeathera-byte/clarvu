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
    business_type?: "revenue" | "admin" | "learning" | "personal" | "break" | "other" | null;
  } | null | any | any[];
}

interface PeakHour {
  hour: number; // 0-23
  productiveMinutes: number;
  totalMinutes: number;
  efficiency: number; // 0-1
}

interface DeepWorkWindow {
  start: string; // ISO time
  end: string; // ISO time
  duration: number; // minutes
  category: string;
}

interface DistractionWindow {
  start: string; // ISO time
  end: string; // ISO time
  duration: number; // minutes
  type: "break" | "waste";
}

interface EnergyCurve {
  morning: "high" | "medium" | "low";
  afternoon: "high" | "medium" | "low";
  evening: "high" | "medium" | "low";
}

/**
 * Detect peak focus hours from activity logs
 * Groups logs by hour and measures productive minutes per hour
 */
export function detectPeakHours(logs: ActivityLog[] | any[]): PeakHour[] {
  const typedLogs = logs as ActivityLog[];
  if (logs.length === 0) {
    return [];
  }

  // Initialize hourly tracking
  const hourlyData: Record<number, { productive: number; total: number }> = {};
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { productive: 0, total: 0 };
  }

  // Process logs and group by hour
  typedLogs.forEach((log) => {
    if (!log.start_time || !log.end_time) return;

    const start = new Date(log.start_time);
    const end = new Date(log.end_time);
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60)); // minutes

    // Get business type
    const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
    const isProductive = businessType === "revenue" || businessType === "learning";

    // Distribute duration across hours
    let currentTime = new Date(start);
    while (currentTime < end) {
      const hour = currentTime.getHours();
      const nextHour = new Date(currentTime);
      nextHour.setHours(hour + 1, 0, 0, 0);
      
      const segmentEnd = nextHour < end ? nextHour : end;
      const segmentMinutes = Math.floor(
        (segmentEnd.getTime() - currentTime.getTime()) / (1000 * 60)
      );

      hourlyData[hour].total += segmentMinutes;
      if (isProductive) {
        hourlyData[hour].productive += segmentMinutes;
      }

      currentTime = segmentEnd;
    }
  });

  // Calculate efficiency and create PeakHour objects
  const peakHours: PeakHour[] = Object.entries(hourlyData)
    .map(([hourStr, data]) => {
      const hour = parseInt(hourStr);
      const efficiency = data.total > 0 ? data.productive / data.total : 0;
      
      return {
        hour,
        productiveMinutes: data.productive,
        totalMinutes: data.total,
        efficiency,
      };
    })
    .filter((ph) => ph.totalMinutes > 0) // Only hours with activity
    .sort((a, b) => {
      // Sort by efficiency first, then by productive minutes
      if (Math.abs(a.efficiency - b.efficiency) > 0.1) {
        return b.efficiency - a.efficiency;
      }
      return b.productiveMinutes - a.productiveMinutes;
    });

  // Return top 2-3 hours
  return peakHours.slice(0, 3);
}

/**
 * Detect deep work windows (continuous blocks > 45 min)
 */
export function detectDeepWorkWindows(logs: ActivityLog[] | any[]): DeepWorkWindow[] {
  const typedLogs = logs as ActivityLog[];
  if (logs.length === 0) {
    return [];
  }

  const deepWorkWindows: DeepWorkWindow[] = [];
  const minDuration = 45; // minutes

  // Sort logs by start time
  const sortedLogs = [...logs]
    .filter((log) => log.start_time && log.end_time)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Check for deep work patterns
  const revenueCategories = ["Work", "Deep Work", "Coding"];
  
  sortedLogs.forEach((log) => {
    if (!log.start_time || !log.end_time) return;

    const start = new Date(log.start_time);
    const end = new Date(log.end_time);
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));

    const categoryName = log.categories?.name || "";
    const businessType = log.categories?.business_type || inferBusinessType(categoryName);
    const isRevenue = businessType === "revenue" || 
      revenueCategories.some((cat) => categoryName.toLowerCase().includes(cat.toLowerCase()));

    if (isRevenue && duration >= minDuration) {
      deepWorkWindows.push({
        start: log.start_time,
        end: log.end_time,
        duration,
        category: categoryName || "Work",
      });
    }
  });

  // Sort by duration (longest first)
  deepWorkWindows.sort((a, b) => b.duration - a.duration);

  return deepWorkWindows;
}

/**
 * Detect distraction windows (clusters of break/waste)
 */
export function detectDistractionWindows(logs: ActivityLog[] | any[]): DistractionWindow[] {
  const typedLogs = logs as ActivityLog[];
  if (logs.length === 0) {
    return [];
  }

  const distractionWindows: DistractionWindow[] = [];
  
  // Sort logs by start time
  const sortedLogs = [...typedLogs]
    .filter((log) => log.start_time && log.end_time)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  sortedLogs.forEach((log: ActivityLog) => {
    if (!log.start_time || !log.end_time) return;

    const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
    const categoryName = log.categories?.name || "";

    const isBreak = businessType === "break" || 
      categoryName.toLowerCase().includes("break");
    const isWaste = businessType === "other" || 
      categoryName.toLowerCase().includes("waste");

    if (isBreak || isWaste) {
      const start = new Date(log.start_time);
      const end = new Date(log.end_time);
      const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));

      distractionWindows.push({
        start: log.start_time,
        end: log.end_time,
        duration,
        type: isBreak ? "break" : "waste",
      });
    }
  });

  return distractionWindows;
}

/**
 * Detect energy curve (morning/afternoon/evening)
 * Returns simplified energy levels: high/medium/low
 */
export function detectEnergyCurve(logs: ActivityLog[] | any[]): EnergyCurve {
  const typedLogs = logs as ActivityLog[];
  if (logs.length === 0) {
    return {
      morning: "medium",
      afternoon: "medium",
      evening: "medium",
    };
  }

  const periodData = {
    morning: { productive: 0, total: 0 }, // 6am - 12pm
    afternoon: { productive: 0, total: 0 }, // 12pm - 5pm
    evening: { productive: 0, total: 0 }, // 5pm - 11pm
  };

  typedLogs.forEach((log: ActivityLog) => {
    if (!log.start_time || !log.end_time) return;

    const start = new Date(log.start_time);
    const hour = start.getHours();
    const duration = Math.floor(
      (new Date(log.end_time).getTime() - start.getTime()) / (1000 * 60)
    );

    const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
    const isProductive = businessType === "revenue" || businessType === "learning";

    let period: "morning" | "afternoon" | "evening";
    if (hour >= 6 && hour < 12) {
      period = "morning";
    } else if (hour >= 12 && hour < 17) {
      period = "afternoon";
    } else if (hour >= 17 && hour < 23) {
      period = "evening";
    } else {
      return; // Skip outside standard hours
    }

    periodData[period].total += duration;
    if (isProductive) {
      periodData[period].productive += duration;
    }
  });

  // Calculate efficiency and determine energy level
  const getEnergyLevel = (productive: number, total: number): "high" | "medium" | "low" => {
    if (total === 0) return "medium";
    const efficiency = productive / total;
    if (efficiency >= 0.7) return "high";
    if (efficiency >= 0.4) return "medium";
    return "low";
  };

  return {
    morning: getEnergyLevel(periodData.morning.productive, periodData.morning.total),
    afternoon: getEnergyLevel(periodData.afternoon.productive, periodData.afternoon.total),
    evening: getEnergyLevel(periodData.evening.productive, periodData.evening.total),
  };
}

/**
 * Helper: Infer business type from category name
 */
function inferBusinessType(categoryName: string | null | undefined): string {
  if (!categoryName) return "other";
  
  const name = categoryName.toLowerCase();
  if (name.includes("work") || name.includes("deep")) return "revenue";
  if (name.includes("admin")) return "admin";
  if (name.includes("personal")) return "personal";
  if (name.includes("break") || name.includes("rest")) return "break";
  if (name.includes("learn") || name.includes("study")) return "learning";
  if (name.includes("waste")) return "other";
  
  return "other";
}

