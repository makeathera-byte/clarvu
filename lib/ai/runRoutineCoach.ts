import { createClient } from "@supabase/supabase-js";
import {
  detectPeakHours,
  detectDeepWorkWindows,
  detectDistractionWindows,
  detectEnergyCurve,
} from "@/lib/insights/focusPatterns";
import { buildRoutineFromPatterns } from "@/lib/insights/routineBuilder";
import { runGroqChat } from "./groq";

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
  } | null | any;
}

interface RoutineResponse {
  routine: {
    morning: Array<{
      type: string;
      start: string;
      end: string;
      duration: number;
    }>;
    afternoon: Array<{
      type: string;
      start: string;
      end: string;
      duration: number;
    }>;
    evening: Array<{
      type: string;
      start: string;
      end: string;
      duration: number;
    }>;
    suggested_breaks?: Array<{
      time: string;
      duration: number;
    }>;
  };
  explanation: string;
}

/**
 * Generate AI-powered routine recommendations
 * Analyzes past 7 days of logs and generates personalized routine
 */
export async function runRoutineCoach(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string
): Promise<RoutineResponse | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch last 7 days of logs
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const { data: logs, error: logsError } = await supabase
      .from("activity_logs")
      .select(`
        *,
        categories (
          id,
          name,
          color,
          business_type
        )
      `)
      .eq("user_id", userId)
      .gte("start_time", startDate.toISOString())
      .lt("start_time", endDate.toISOString())
      .order("start_time", { ascending: true });

    if (logsError) {
      console.error(`Error fetching logs for routine coach:`, logsError);
      return null;
    }

    if (!logs || logs.length === 0) {
      console.log(`No logs found for user ${userId} in past 7 days`);
      return null;
    }

    // Detect patterns
    const peakHours = detectPeakHours(logs as ActivityLog[]);
    const deepWorkWindows = detectDeepWorkWindows(logs as ActivityLog[]);
    const distractionWindows = detectDistractionWindows(logs as ActivityLog[]);
    const energyCurve = detectEnergyCurve(logs as ActivityLog[]);

    // Build baseline routine (non-AI fallback)
    const baselineRoutine = buildRoutineFromPatterns({
      peakHours,
      deepWorkWindows,
      distractionWindows,
      energyCurve,
    });

    // Build compact JSON summary for AI
    const peakHoursSummary = peakHours
      .map((ph) => `${ph.hour}:00 (${ph.productiveMinutes}min productive, ${(ph.efficiency * 100).toFixed(0)}% efficiency)`)
      .join(", ");

    const deepWorkSummary = deepWorkWindows
      .slice(0, 3)
      .map((dw) => {
        const start = new Date(dw.start);
        return `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} (${dw.duration}min)`;
      })
      .join(", ") || "None detected";

    const distractionSummary = distractionWindows.length > 0
      ? `${distractionWindows.length} distraction periods detected`
      : "Minimal distractions";

    // Build AI prompt
    const prompt = `Analyze this productivity data from the past 7 days and generate an optimized daily routine.

**Focus Patterns:**
- Peak hours: ${peakHoursSummary || "None detected"}
- Deep work windows: ${deepWorkSummary}
- Energy levels: Morning ${energyCurve.morning}, Afternoon ${energyCurve.afternoon}, Evening ${energyCurve.evening}
- Distractions: ${distractionSummary}

**Baseline Routine:**
${JSON.stringify(baselineRoutine, null, 2)}

Generate a JSON response with an optimized routine and explanation:
{
  "routine": {
    "morning": [{"type": "deep_work", "start": "10:00", "end": "12:00", "duration": 120}, ...],
    "afternoon": [...],
    "evening": [...],
    "suggested_breaks": [{"time": "12:00", "duration": 30}, ...]
  },
  "explanation": "Your best focus happens between 10AM–12PM. Schedule your most important work during this window. Your energy dips in the afternoon, so use that time for lighter tasks..."
}

Return ONLY valid JSON.`;

    // Call Groq AI
    const aiResponse = await runGroqChat<RoutineResponse>(
      prompt,
      true,
      "llama-3.1-8b-instant"
    );

    if (!aiResponse || !aiResponse.routine) {
      // Fallback to baseline routine
      return {
        routine: baselineRoutine,
        explanation:
          "Based on your activity patterns, here's a recommended routine. Schedule deep work during your peak focus hours and lighter tasks when your energy is lower.",
      };
    }

    // Ensure all required fields exist
    const enhancedRoutine: RoutineResponse = {
      routine: {
        morning: aiResponse.routine.morning || baselineRoutine.morning,
        afternoon: aiResponse.routine.afternoon || baselineRoutine.afternoon,
        evening: aiResponse.routine.evening || baselineRoutine.evening,
        suggested_breaks: aiResponse.routine.suggested_breaks || baselineRoutine.suggested_breaks,
      },
      explanation:
        aiResponse.explanation ||
        "Here's a personalized routine based on your productivity patterns.",
    };

    return enhancedRoutine;
  } catch (error: any) {
    console.error(`Error in routine coach for user ${userId}:`, error);
    return null;
  }
}

