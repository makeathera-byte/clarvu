import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { logEvent } from "@/lib/analytics/logEvent";
import {
  detectPeakHours,
  detectDeepWorkWindows,
  detectDistractionWindows,
  detectEnergyCurve,
} from "@/lib/insights/focusPatterns";
import { buildRoutineFromPatterns } from "@/lib/insights/routineBuilder";
import { runRoutineCoach } from "@/lib/ai/runRoutineCoach";

/**
 * GET /api/routine
 * Fetch existing routine for today (if exists)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserOrThrow();
    const supabase = await createClient();

    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0];

    // Try to get today's routine
    // Skip if table doesn't exist (graceful degradation)
    let cachedToday = null;
    
    try {
      // First, try to get today's routine
      const result = await supabase
        .from("routine_summaries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayDateStr)
        .maybeSingle();
      
      // If table doesn't exist or schema cache error, skip cache check
      if (result.error && (result.error.code === "42P01" || result.error.message?.includes("schema cache") || result.error.message?.includes("Could not find the table"))) {
        console.warn("routine_summaries table not accessible, skipping cache check");
        cachedToday = null;
      } else if (!result.error && result.data) {
        cachedToday = result.data;
        console.log("✅ Found cached routine for today:", {
          date: todayDateStr,
          hasRoutine: !!cachedToday.routine,
          created_at: cachedToday.created_at
        });
      } else if (result.error && result.error.code !== "PGRST116") {
        // PGRST116 = no rows found, which is fine
        console.warn("Error fetching routine:", result.error);
      }
      
      // If no routine found for today, try to get the most recent routine
      if (!cachedToday) {
        console.log("No routine found for today, checking for most recent routine...");
        const recentResult = await supabase
          .from("routine_summaries")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!recentResult.error && recentResult.data) {
          const recentDate = recentResult.data.date;
          const recentDateStr = typeof recentDate === 'string' ? recentDate : new Date(recentDate).toISOString().split("T")[0];
          
          // If the most recent routine is from today or yesterday, use it
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayDateStr = yesterday.toISOString().split("T")[0];
          
          if (recentDateStr === todayDateStr || recentDateStr === yesterdayDateStr) {
            cachedToday = recentResult.data;
            console.log("✅ Found recent routine (from yesterday or today):", {
              date: recentDateStr,
              today: todayDateStr,
              hasRoutine: !!cachedToday.routine
            });
          } else {
            console.log("Most recent routine is too old:", recentDateStr);
          }
        }
      }
    } catch (err: any) {
      // If any error, skip cache check and continue
      console.warn("Cache check failed, continuing anyway:", err.message);
      cachedToday = null;
    }

    if (cachedToday && cachedToday.routine) {
      return successResponse({
        routine: cachedToday.routine,
        explanation: cachedToday.explanation,
        hasEnoughData: true,
        cached: true,
        cachedAt: cachedToday.created_at,
      });
    }

    // No routine found for today
    return successResponse({
      routine: null,
      hasEnoughData: false,
      message: "No routine found for today. Generate one to get started!",
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/routine
 * Generate routine (with caching and rate limiting)
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();
    const supabase = await createClient();

    // Get today's date (ensure consistent format)
    const today = new Date();
    // Use UTC to avoid timezone issues
    const todayDateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    
    console.log("📅 Generating routine for date:", todayDateStr, "User:", user.id);

    // === RATE LIMITING CHECK ===
    // Check if user has generated routine more than 3 times in last hour
    // Skip if table doesn't exist (graceful degradation)
    let rateLimitExceeded = false;
    try {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data: recentRoutines, error: rateLimitError } = await supabase
        .from("routine_summaries")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", oneHourAgo.toISOString())
        .order("created_at", { ascending: false });

      // If table doesn't exist, skip rate limiting (graceful degradation)
      if (rateLimitError && (rateLimitError.code === "42P01" || rateLimitError.message?.includes("schema cache") || rateLimitError.message?.includes("Could not find the table"))) {
        console.warn("routine_summaries table not accessible, skipping rate limiting");
        rateLimitExceeded = false;
      } else if (!rateLimitError && recentRoutines && recentRoutines.length >= 3) {
        rateLimitExceeded = true;
      }
    } catch (err: any) {
      // If any error, skip rate limiting
      console.warn("Rate limit check failed, continuing anyway:", err.message);
      rateLimitExceeded = false;
    }

    if (rateLimitExceeded) {
      return errorResponse(
        "You're generating routines too frequently. Try again later.",
        429
      );
    }

    // === SPAM PROTECTION ===
    // If user generated routine within last 10 minutes, return cached result
    // Skip if table doesn't exist (graceful degradation)
    try {
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

      // If table doesn't exist, skip spam check (graceful degradation)
      if (spamCheckError && (spamCheckError.code === "42P01" || spamCheckError.message?.includes("schema cache") || spamCheckError.message?.includes("Could not find the table"))) {
        console.warn("routine_summaries table not accessible, skipping spam protection");
      } else if (!spamCheckError && recentRoutine) {
        // Return cached routine instead of regenerating
        return successResponse({
          routine: recentRoutine.routine,
          explanation: recentRoutine.explanation,
          hasEnoughData: true,
          cached: true,
          message: "Using recently generated routine (generated within last 10 minutes)",
        });
      }
    } catch (err: any) {
      // If any error, skip spam check and continue
      console.warn("Spam check failed, continuing anyway:", err.message);
    }

    // === CHECK CACHE FOR TODAY ===
    // Before calling AI, check if routine exists for today
    let cachedToday = null;
    let cacheError = null;
    
    try {
      const result = await supabase
        .from("routine_summaries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayDateStr)
        .maybeSingle();
      
      cachedToday = result.data;
      cacheError = result.error;
      
      // If schema cache error, try once more after a short delay
      if (cacheError && (cacheError.message?.includes("schema cache") || cacheError.message?.includes("Could not find the table"))) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        const retryResult = await supabase
          .from("routine_summaries")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", todayDateStr)
          .maybeSingle();
        cachedToday = retryResult.data;
        cacheError = retryResult.error;
      }
    } catch (err: any) {
      // If it's a schema cache error, continue anyway - we'll try to save later
      if (err.message?.includes("schema cache") || err.message?.includes("Could not find the table")) {
        console.warn("Schema cache issue detected, continuing with routine generation...");
        cacheError = null; // Clear error so we continue
      } else {
        cacheError = err;
      }
    }

    // Only return error if it's a real table missing error (not schema cache)
    if (cacheError && cacheError.code === "42P01") {
      return errorResponse(
        "The routine_summaries table hasn't been created yet. Please run the SQL migration in your Supabase dashboard. See CREATE_ROUTINE_TABLE.md for instructions.",
        500
      );
    }

    if (!cacheError && cachedToday) {
      // Return cached routine for today
      // Log that a routine was accessed (even if cached, it was generated before)
      try {
        await logEvent(user.id, "routine_generated");
      } catch (logError) {
        console.error("Error logging cached routine access:", logError);
      }
      
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

    // Check if GROQ_API_KEY is configured
    const groqApiKey = process.env.GROQ_API_KEY;
    if (supabaseUrl && supabaseServiceKey && groqApiKey) {
      try {
        aiRoutine = await runRoutineCoach(supabaseUrl, supabaseServiceKey, user.id);
      } catch (aiError: any) {
        console.error("AI routine generation failed:", aiError);
        console.error("Error details:", {
          message: aiError?.message,
          status: aiError?.status,
          code: aiError?.code,
        });
        
        // If 429 error, try to return cached routine from today or yesterday
        if (aiError?.message?.includes("429") || aiError?.status === 429) {
          try {
            // Try yesterday's routine
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDateStr = yesterday.toISOString().split("T")[0];

            const { data: yesterdayRoutine } = await supabase
              .from("routine_summaries")
              .select("*")
              .eq("user_id", user.id)
              .eq("date", yesterdayDateStr)
              .maybeSingle();

            if (yesterdayRoutine) {
              return successResponse({
                routine: yesterdayRoutine.routine,
                explanation: yesterdayRoutine.explanation,
                hasEnoughData: true,
                cached: true,
                message: "Too many AI requests right now — showing your last saved routine.",
              });
            }
          } catch (err) {
            // If table doesn't exist, just continue with baseline routine
            console.warn("Could not fetch yesterday's routine, using baseline");
          }
        }
        // Continue with baseline routine if no cache available
      }
    } else {
      console.warn("AI routine generation skipped - missing environment variables:", {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        hasGroqKey: !!groqApiKey,
      });
    }

    // Use AI routine if available, otherwise use baseline
    const finalRoutine = aiRoutine || {
      routine: baselineRoutine,
      explanation:
        "Based on your activity patterns, here's a recommended routine. Schedule deep work during your peak focus hours and lighter tasks when your energy is lower.",
    };

    // === SAVE TO CACHE ===
    // Save routine to database cache (skip if table doesn't exist - graceful degradation)
    let savedRoutine = null;
    let saveSuccess = false;
    
    try {
      const saveData = {
        user_id: user.id,
        date: todayDateStr, // Ensure this is YYYY-MM-DD format
        routine: finalRoutine.routine,
        explanation: finalRoutine.explanation,
        updated_at: new Date().toISOString(),
      };
      
      console.log("💾 Attempting to save routine:", {
        user_id: user.id,
        date: todayDateStr,
        dateType: typeof todayDateStr,
        hasRoutine: !!finalRoutine.routine,
        routineKeys: finalRoutine.routine ? Object.keys(finalRoutine.routine) : []
      });

      // First try to save
      console.log("💾 Saving routine with data:", {
        user_id: saveData.user_id,
        date: saveData.date,
        dateType: typeof saveData.date,
        routineType: typeof saveData.routine,
        explanationLength: saveData.explanation?.length
      });
      
      const saveResult = await supabase
        .from("routine_summaries")
        .upsert(saveData, {
          onConflict: "user_id,date",
        })
        .select()
        .single();
      
      console.log("💾 Save result:", {
        error: saveResult.error?.message,
        errorCode: saveResult.error?.code,
        hasData: !!saveResult.data,
        dataDate: saveResult.data?.date
      });
      
      if (saveResult.error) {
        // If table doesn't exist or schema cache error, try once more after delay
        if (saveResult.error.message?.includes("schema cache") || saveResult.error.message?.includes("Could not find the table")) {
          console.warn("Schema cache issue when saving, retrying after delay...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const retryResult = await supabase
            .from("routine_summaries")
            .upsert(saveData, {
              onConflict: "user_id,date",
            })
            .select()
            .single();
          
          if (!retryResult.error && retryResult.data) {
            savedRoutine = retryResult.data;
            saveSuccess = true;
            console.log("✅ Routine saved successfully (after retry):", {
              date: todayDateStr,
              user_id: user.id
            });
          } else if (retryResult.error) {
            console.warn("Could not save routine to cache (table not accessible after retry):", retryResult.error.message);
          }
        } else if (saveResult.error.code === "42P01") {
          console.warn("routine_summaries table doesn't exist. User needs to run migration.");
        } else {
          console.error("Error saving routine to cache:", saveResult.error);
        }
      } else if (saveResult.data) {
        savedRoutine = saveResult.data;
        saveSuccess = true;
        console.log("✅ Routine saved successfully to database:", {
          date: todayDateStr,
          user_id: user.id,
          hasRoutine: !!savedRoutine.routine
        });
      }
      
      // Verify the save by reading it back (with retry for schema cache)
      if (saveSuccess) {
        // Wait a moment for the database to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let verifyResult = await supabase
          .from("routine_summaries")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", todayDateStr)
          .maybeSingle();
        
        if (!verifyResult.data && verifyResult.error?.message?.includes("schema cache")) {
          // Retry after delay if schema cache issue
          await new Promise(resolve => setTimeout(resolve, 2000));
          verifyResult = await supabase
            .from("routine_summaries")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", todayDateStr)
            .maybeSingle();
        }
        
        // Log routine generation regardless of verification
        // (verification might fail due to schema cache, but routine was still generated)
        try {
          await logEvent(user.id, "routine_generated");
          console.log("✅ Logged routine_generated event for user:", user.id);
        } catch (logError) {
          console.error("❌ Error logging routine generation:", logError);
        }
        
        if (verifyResult.data) {
          console.log("✅ Verified: Routine is in database and can be retrieved", {
            date: verifyResult.data.date,
            hasRoutine: !!verifyResult.data.routine
          });
        } else {
          console.warn("⚠️ Warning: Routine was saved but cannot be retrieved immediately", {
            error: verifyResult.error?.message,
            date: todayDateStr
          });
          
          // Try to find it by checking all routines for this user
          const allRoutines = await supabase
            .from("routine_summaries")
            .select("date, id")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(5);
          
          if (allRoutines.data) {
            console.log("Available routines in database:", allRoutines.data.map(r => r.date));
          }
        }
      } else {
        // Even if save failed, log that a routine was generated
        // (user still got a routine, just wasn't cached)
        try {
          await logEvent(user.id, "routine_generated");
          console.log("✅ Logged routine_generated event (save failed but routine generated)");
        } catch (logError) {
          console.error("❌ Error logging routine generation:", logError);
        }
      }
    } catch (err: any) {
      // If any error saving, just log and continue
      console.warn("Failed to save routine to cache:", err.message);
      // Continue anyway - cache failure shouldn't block response
    }

    // Return the saved routine data (or generated routine if save failed)
    return successResponse({
      ...finalRoutine,
      hasEnoughData: true,
      patterns: {
        peakHours,
        energyCurve,
        deepWorkCount: deepWorkWindows.length,
      },
      saved: saveSuccess, // Indicate if it was successfully saved
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}
