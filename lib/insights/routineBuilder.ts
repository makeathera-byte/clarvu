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
 * Enhanced with more detailed and useful routine blocks
 */
export function buildRoutineFromPatterns(patterns: FocusPatterns): Routine {
  const routine: Routine = {
    morning: [],
    afternoon: [],
    evening: [],
    suggested_breaks: [],
  };

  // Extract peak hours (sorted by efficiency)
  const peakHours = patterns.peakHours
    .filter((ph) => ph.efficiency > 0.5 && ph.productiveMinutes > 30)
    .sort((a, b) => a.hour - b.hour);
  
  const primaryPeakHour = peakHours.length > 0 ? peakHours[0].hour : null;
  const secondaryPeakHour = peakHours.length > 1 ? peakHours[1].hour : null;

  // Use actual deep work windows if available
  const deepWorkWindows = patterns.deepWorkWindows
    .filter((dw) => dw.duration >= 45)
    .sort((a, b) => {
      const aHour = new Date(a.start).getHours();
      const bHour = new Date(b.start).getHours();
      return aHour - bHour;
    });

  // === MORNING ROUTINE (8 AM - 12 PM) ===
  const morningStart = "08:00";
  const morningEnd = "12:00";

  // Find morning deep work window
  const morningDeepWork = deepWorkWindows.find((dw) => {
    const hour = new Date(dw.start).getHours();
    return hour >= 8 && hour < 12;
  });

  if (morningDeepWork) {
    // Use actual detected deep work window
    const start = new Date(morningDeepWork.start);
    const end = new Date(morningDeepWork.end);
    const startStr = `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`;
    const endStr = `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
    
    // Add admin/planning before deep work
    if (start.getHours() > 8) {
      routine.morning.push({
        type: "admin",
        start: "08:30",
        end: startStr,
        duration: calculateDuration("08:30", startStr),
      });
    }

    routine.morning.push({
      type: "deep_work",
      start: startStr,
      end: endStr,
      duration: morningDeepWork.duration,
    });

    // Add shallow work or admin after deep work
    if (end.getHours() < 12) {
      const afterEnd = new Date(end);
      afterEnd.setHours(12, 0, 0);
      const afterEndStr = `${afterEnd.getHours().toString().padStart(2, "0")}:00`;
      routine.morning.push({
        type: "shallow_work",
        start: endStr,
        end: afterEndStr,
        duration: calculateDuration(endStr, afterEndStr),
      });
    }
  } else if (primaryPeakHour !== null && primaryPeakHour >= 8 && primaryPeakHour < 12) {
    // Use peak hour for deep work
    const deepWorkStart = `${primaryPeakHour.toString().padStart(2, "0")}:00`;
    const deepWorkEnd = `${Math.min(primaryPeakHour + 2, 12).toString().padStart(2, "0")}:00`;

    routine.morning.push({
      type: "admin",
      start: "08:30",
      end: deepWorkStart,
      duration: calculateDuration("08:30", deepWorkStart),
    });

    routine.morning.push({
      type: "deep_work",
      start: deepWorkStart,
      end: deepWorkEnd,
      duration: calculateDuration(deepWorkStart, deepWorkEnd),
    });

    if (parseInt(deepWorkEnd.split(":")[0]) < 12) {
      routine.morning.push({
        type: "shallow_work",
        start: deepWorkEnd,
        end: "12:00",
        duration: calculateDuration(deepWorkEnd, "12:00"),
      });
    }
  } else {
    // Default morning schedule based on energy
    if (patterns.energyCurve.morning === "high") {
      routine.morning.push({
        type: "admin",
        start: "08:30",
        end: "09:30",
        duration: 60,
      });
      routine.morning.push({
        type: "deep_work",
        start: "09:30",
        end: "11:30",
        duration: 120,
      });
      routine.morning.push({
        type: "shallow_work",
        start: "11:30",
        end: "12:00",
        duration: 30,
      });
    } else {
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
  }

  // === AFTERNOON ROUTINE (12 PM - 5 PM) ===
  const afternoonStart = "13:00"; // After lunch
  const afternoonEnd = "17:00";

  // Find afternoon deep work window
  const afternoonDeepWork = deepWorkWindows.find((dw) => {
    const hour = new Date(dw.start).getHours();
    return hour >= 12 && hour < 17;
  });

  if (afternoonDeepWork) {
    const start = new Date(afternoonDeepWork.start);
    const end = new Date(afternoonDeepWork.end);
    const startStr = `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`;
    const endStr = `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;

    // Add shallow work before if there's time
    if (start.getHours() > 13) {
      routine.afternoon.push({
        type: "shallow_work",
        start: "13:00",
        end: startStr,
        duration: calculateDuration("13:00", startStr),
      });
    }

    routine.afternoon.push({
      type: "deep_work",
      start: startStr,
      end: endStr,
      duration: afternoonDeepWork.duration,
    });
  } else if (secondaryPeakHour !== null && secondaryPeakHour >= 12 && secondaryPeakHour < 17) {
    // Use secondary peak hour
    const deepWorkStart = `${secondaryPeakHour.toString().padStart(2, "0")}:00`;
    const deepWorkEnd = `${Math.min(secondaryPeakHour + 2, 17).toString().padStart(2, "0")}:00`;

    routine.afternoon.push({
      type: "shallow_work",
      start: "13:00",
      end: deepWorkStart,
      duration: calculateDuration("13:00", deepWorkStart),
    });

    routine.afternoon.push({
      type: "deep_work",
      start: deepWorkStart,
      end: deepWorkEnd,
      duration: calculateDuration(deepWorkStart, deepWorkEnd),
    });
  } else if (patterns.energyCurve.afternoon === "high") {
    routine.afternoon.push({
      type: "deep_work",
      start: "14:00",
      end: "16:00",
      duration: 120,
    });
    routine.afternoon.push({
      type: "shallow_work",
      start: "16:00",
      end: "17:00",
      duration: 60,
    });
  } else {
    routine.afternoon.push({
      type: "shallow_work",
      start: "13:00",
      end: "15:00",
      duration: 120,
    });
    routine.afternoon.push({
      type: "admin",
      start: "15:00",
      end: "16:00",
      duration: 60,
    });
  }

  // === EVENING ROUTINE (5 PM - 9 PM) ===
  if (patterns.energyCurve.evening === "high") {
    routine.evening.push({
      type: "learning",
      start: "17:30",
      end: "19:00",
      duration: 90,
    });
    routine.evening.push({
      type: "personal",
      start: "19:00",
      end: "20:00",
      duration: 60,
    });
  } else if (patterns.energyCurve.evening === "medium") {
    routine.evening.push({
      type: "learning",
      start: "18:00",
      end: "19:00",
      duration: 60,
    });
    routine.evening.push({
      type: "personal",
      start: "19:00",
      end: "20:00",
      duration: 60,
    });
  } else {
    routine.evening.push({
      type: "personal",
      start: "17:30",
      end: "19:00",
      duration: 90,
    });
  }

  // === SUGGESTED BREAKS ===
  // Add breaks based on detected patterns and routine gaps
  routine.suggested_breaks = [
    { time: "12:00", duration: 30 }, // Lunch break
  ];

  // Add mid-afternoon break if there's a long afternoon block
  const afternoonBlocks = routine.afternoon;
  if (afternoonBlocks.length > 0 && afternoonBlocks[0].duration > 90) {
    const breakTime = new Date(`2000-01-01T${afternoonBlocks[0].start}`);
    breakTime.setMinutes(breakTime.getMinutes() + Math.floor(afternoonBlocks[0].duration / 2));
    routine.suggested_breaks.push({
      time: `${breakTime.getHours().toString().padStart(2, "0")}:${breakTime.getMinutes().toString().padStart(2, "0")}`,
      duration: 15,
    });
  } else {
    routine.suggested_breaks.push({ time: "15:00", duration: 15 });
  }

  // Add morning break if morning deep work is long
  const morningDeepWorkBlock = routine.morning.find((b) => b.type === "deep_work");
  if (morningDeepWorkBlock && morningDeepWorkBlock.duration > 120) {
    const breakTime = new Date(`2000-01-01T${morningDeepWorkBlock.start}`);
    breakTime.setMinutes(breakTime.getMinutes() + 60);
    routine.suggested_breaks.push({
      time: `${breakTime.getHours().toString().padStart(2, "0")}:${breakTime.getMinutes().toString().padStart(2, "0")}`,
      duration: 10,
    });
  }

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

