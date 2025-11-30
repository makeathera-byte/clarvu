import { createClient } from "@supabase/supabase-js";
import { buildDailyPrompt, buildFocusPrompt } from "./prompts";
import { calculateFocusMetrics } from "./focusScore";
import { runGroqChat } from "./groq";

interface ActivityLog {
  activity: string;
  start_time: string;
  end_time: string | null;
  category_id: string | null;
  categories?: { name: string; color: string } | null;
}

interface DailyResult {
  summary: string;
  focus_score: number;
  insights: string;
}

/**
 * Process daily summary for a user
 * Fetches logs, calculates metrics, generates AI summary
 * Does NOT write to database - returns structured result
 */
export async function runDaily(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string,
  date: string
): Promise<DailyResult | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch today's logs
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const { data: logs, error: logsError } = await supabase
      .from("activity_logs")
      .select(`
        activity,
        start_time,
        end_time,
        category_id,
        categories (
          name,
          color
        )
      `)
      .eq("user_id", userId)
      .gte("start_time", startOfDay.toISOString())
      .lt("start_time", endOfDay.toISOString())
      .order("start_time", { ascending: true });

    if (logsError) {
      console.error(`Error fetching logs for user ${userId}:`, logsError);
      return null;
    }

    if (!logs || logs.length === 0) {
      console.log(`No logs found for user ${userId} on ${date}`);
      return null;
    }

    // Calculate metrics
    const metrics = calculateFocusMetrics(logs as unknown as ActivityLog[]);

    // Calculate deterministic focus score as baseline
    const deterministicScore = require("./focusScore").calculateFocusScore(metrics);

    // Generate AI summary prompt
    const summaryPrompt = buildDailyPrompt(logs as unknown as ActivityLog[], metrics);
    
    // Call Groq for summary
    const summaryResult = await runGroqChat<{
      summary: string;
      focus_score: number;
      insights: string;
    }>(summaryPrompt, true, "mixtral-8x7b-32768");

    if (!summaryResult) {
      console.error(`Failed to generate summary for user ${userId}`);
      return null;
    }

    // Use AI focus score if provided, otherwise use deterministic
    const focusScore = summaryResult.focus_score ?? deterministicScore;

    return {
      summary: summaryResult.summary || "No summary generated.",
      focus_score: Math.max(0, Math.min(100, Math.round(focusScore))),
      insights: summaryResult.insights || "",
    };
  } catch (error: any) {
    console.error(`Error processing daily summary for user ${userId}:`, error);
    return null;
  }
}

