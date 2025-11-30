import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import {
  detectPeakHours,
  detectDeepWorkWindows,
  detectDistractionWindows,
  detectEnergyCurve,
} from "@/lib/insights/focusPatterns";
import { buildRoutineFromPatterns } from "@/lib/insights/routineBuilder";
import { runRoutineCoach } from "@/lib/ai/runRoutineCoach";

/**
 * POST /api/routine
 * Generate routine (with caching and rate limiting)
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();
    const supabase = await createClient();

    // Get today's date
    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    // === RATE LIMITING CHECK ===
    // Check if user has generated routine more than 3 times in last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: recentRoutines, error: rateLimitError } = await supabase
      .from("routine_summaries")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo.toISOString())
      .order("created_at", { ascending: false });

    if (!rateLimitError && recentRoutines && recentRoutines.length >= 3) {
      return errorResponse(
        "You're generating routines too frequently. Try again later.",
        429
      );
    }

    // === SPAM PROTECTION ===
    // If user generated routine within last 10 minutes, return cached result
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const { data: recentRoutine, error: spamCheckError } = await supabase
      .from("routine_summaries")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", tenMinutesAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!spamCheckError && recentRoutine) {
      // Return cached routine instead of regenerating
      return successResponse({
        routine: recentRoutine.routine,
        explanation: recentRoutine.explanation,
        hasEnoughData: true,
        cached: true,
        message: "Using recently generated routine (generated within last 10 minutes)",
      });
    }

    // === CHECK CACHE FOR TODAY ===
    // Before calling AI, check if routine exists for today
    const { data: cachedToday, error: cacheError } = await supabase
      .from("routine_summaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayDateStr)
      .single();

    if (!cacheError && cachedToday) {
      // Return cached routine for today
      return successResponse({
        routine: cachedToday.routine,
        explanation: cachedToday.explanation,
        hasEnoughData: true,
        cached: true,
      });
    }

    // === GENERATE NEW ROUTINE ===
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
      .eq("user_id", user.id)
      .gte("start_time", startDate.toISOString())
      .lt("start_time", endDate.toISOString())
      .order("start_time", { ascending: true });

    if (logsError) {
      console.error("Error fetching logs for routine:", logsError);
      if (logsError.code === "42P01") {
        return errorResponse("Database tables not set up", 500);
      }
      return errorResponse(logsError.message || "Failed to fetch logs", 500);
    }

    if (!logs || logs.length === 0) {
      // Return empty routine with message
      return successResponse({
        routine: {
          morning: [],
          afternoon: [],
          evening: [],
          suggested_breaks: [],
        },
        explanation:
          "Track at least 7 days of activities to get personalized routine suggestions.",
        hasEnoughData: false,
      });
    }

    // Detect patterns (cast through unknown to avoid type issues)
    const peakHours = detectPeakHours(logs as unknown as any[]);
    const deepWorkWindows = detectDeepWorkWindows(logs as unknown as any[]);
    const distractionWindows = detectDistractionWindows(logs as unknown as any[]);
    const energyCurve = detectEnergyCurve(logs as unknown as any[]);

    // Build baseline routine (always available)
    const baselineRoutine = buildRoutineFromPatterns({
      peakHours,
      deepWorkWindows,
      distractionWindows,
      energyCurve,
    });

    // Try to get AI-enhanced routine (with 429 fallback)
    let aiRoutine = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      try {
        aiRoutine = await runRoutineCoach(supabaseUrl, supabaseServiceKey, user.id);
      } catch (aiError: any) {
        console.error("AI routine generation failed:", aiError);
        
        // If 429 error, try to return cached routine from today or yesterday
        if (aiError?.message?.includes("429") || aiError?.status === 429) {
          // Try yesterday's routine
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayDateStr = yesterday.toISOString().split("T")[0];

          const { data: yesterdayRoutine } = await supabase
            .from("routine_summaries")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", yesterdayDateStr)
            .single();

          if (yesterdayRoutine) {
            return successResponse({
              routine: yesterdayRoutine.routine,
              explanation: yesterdayRoutine.explanation,
              hasEnoughData: true,
              cached: true,
              message: "Too many AI requests right now — showing your last saved routine.",
            });
          }
        }
        // Continue with baseline routine if no cache available
      }
    }

    // Use AI routine if available, otherwise use baseline
    const finalRoutine = aiRoutine || {
      routine: baselineRoutine,
      explanation:
        "Based on your activity patterns, here's a recommended routine. Schedule deep work during your peak focus hours and lighter tasks when your energy is lower.",
    };

    // === SAVE TO CACHE ===
    // Save routine to database cache
    const { error: saveError } = await supabase
      .from("routine_summaries")
      .upsert({
        user_id: user.id,
        date: todayDateStr,
        routine: finalRoutine.routine,
        explanation: finalRoutine.explanation,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,date",
      });

    if (saveError) {
      console.error("Error saving routine to cache:", saveError);
      // Continue anyway - cache failure shouldn't block response
    }

    return successResponse({
      ...finalRoutine,
      hasEnoughData: true,
      patterns: {
        peakHours,
        energyCurve,
        deepWorkCount: deepWorkWindows.length,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}
