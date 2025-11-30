interface RoutineBlock {
  type: "deep_work" | "admin" | "shallow_work" | "learning" | "break" | "personal";
  start: string; // "HH:MM" format
  end: string; // "HH:MM" format
  duration: number; // minutes
}

interface Routine {
  morning: RoutineBlock[];
  afternoon: RoutineBlock[];
  evening: RoutineBlock[];
  suggested_breaks: Array<{ time: string; duration: number }>;
}

interface FocusPatterns {
  peakHours: Array<{ hour: number; productiveMinutes: number; efficiency: number }>;
  deepWorkWindows: Array<{ start: string; end: string; duration: number }>;
  distractionWindows: Array<{ start: string; end: string; duration: number }>;
  energyCurve: {
    morning: "high" | "medium" | "low";
    afternoon: "high" | "medium" | "low";
    evening: "high" | "medium" | "low";
  };
}

/**
 * Build routine structure from detected patterns (non-AI version)
 * This provides a baseline routine even if AI is unavailable
 */
export function buildRoutineFromPatterns(patterns: FocusPatterns): Routine {
  const routine: Routine = {
    morning: [],
    afternoon: [],
    evening: [],
    suggested_breaks: [],
  };

  // Extract peak hours
  const peakHours = patterns.peakHours.map((ph) => ph.hour).sort((a, b) => a - b);
  const primaryPeakHour = peakHours[0];

  // Morning routine (8 AM - 12 PM)
  if (patterns.energyCurve.morning === "high" || primaryPeakHour < 12) {
    // Schedule deep work during peak morning hours
    const deepWorkStart = primaryPeakHour >= 8 && primaryPeakHour < 12 
      ? `${primaryPeakHour.toString().padStart(2, "0")}:00`
      : "10:00";
    const deepWorkEnd = primaryPeakHour >= 8 && primaryPeakHour < 12
      ? `${Math.min(primaryPeakHour + 2, 12).toString().padStart(2, "0")}:00`
      : "12:00";

    routine.morning.push({
      type: "deep_work",
      start: deepWorkStart,
      end: deepWorkEnd,
      duration: calculateDuration(deepWorkStart, deepWorkEnd),
    });

    // Add admin time before or after deep work
    if (primaryPeakHour >= 10) {
      routine.morning.unshift({
        type: "admin",
        start: "09:00",
        end: deepWorkStart,
        duration: calculateDuration("09:00", deepWorkStart),
      });
    } else {
      routine.morning.push({
        type: "admin",
        start: deepWorkEnd,
        end: "12:30",
        duration: calculateDuration(deepWorkEnd, "12:30"),
      });
    }
  } else {
    // Default morning schedule
    routine.morning.push({
      type: "admin",
      start: "09:00",
      end: "10:00",
      duration: 60,
    });
    routine.morning.push({
      type: "deep_work",
      start: "10:00",
      end: "12:00",
      duration: 120,
    });
  }

  // Afternoon routine (12 PM - 5 PM)
  if (patterns.energyCurve.afternoon === "high") {
    const afternoonPeakHour = peakHours.find((h) => h >= 12 && h < 17);
    if (afternoonPeakHour) {
      routine.afternoon.push({
        type: "deep_work",
        start: `${afternoonPeakHour.toString().padStart(2, "0")}:00`,
        end: `${Math.min(afternoonPeakHour + 2, 17).toString().padStart(2, "0")}:00`,
        duration: 120,
      });
    } else {
      routine.afternoon.push({
        type: "shallow_work",
        start: "14:00",
        end: "16:00",
        duration: 120,
      });
    }
  } else {
    routine.afternoon.push({
      type: "shallow_work",
      start: "14:00",
      end: "15:00",
      duration: 60,
    });
  }

  // Evening routine (5 PM - 9 PM)
  if (patterns.energyCurve.evening === "high") {
    routine.evening.push({
      type: "learning",
      start: "17:00",
      end: "18:00",
      duration: 60,
    });
  } else if (patterns.energyCurve.evening === "medium") {
    routine.evening.push({
      type: "personal",
      start: "17:00",
      end: "18:00",
      duration: 60,
    });
  }

  // Suggested breaks
  routine.suggested_breaks = [
    { time: "12:00", duration: 30 }, // Lunch
    { time: "15:00", duration: 15 }, // Mid-afternoon
  ];

  return routine;
}

/**
 * Calculate duration in minutes between two time strings (HH:MM format)
 */
function calculateDuration(start: string, end: string): number {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  
  return endTotal - startTotal;
}

