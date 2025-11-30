import { createClient } from "@supabase/supabase-js";
import { buildWeeklyPrompt } from "./prompts";
import { runGroqChat } from "./groq";

interface WeeklyResult {
  summary: string;
  insights: string;
}

/**
 * Process weekly summary for a user
 * Fetches daily summaries, generates AI weekly summary
 * Does NOT write to database - returns structured result
 */
export async function runWeekly(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string,
  weekStart: string
): Promise<WeeklyResult | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate week end date
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    // Fetch daily summaries from the past week
    const { data: dailySummaries, error: summariesError } = await supabase
      .from("daily_summaries")
      .select("summary, focus_score, insights")
      .eq("user_id", userId)
      .gte("date", weekStart)
      .lt("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (summariesError) {
      console.error(`Error fetching daily summaries for user ${userId}:`, summariesError);
      return null;
    }

    if (!dailySummaries || dailySummaries.length === 0) {
      console.log(`No daily summaries found for user ${userId} for week starting ${weekStart}`);
      return null;
    }

    // Generate weekly summary prompt
    const weeklyPrompt = buildWeeklyPrompt(dailySummaries);

    // Call Groq for weekly summary
    const weeklyResult = await runGroqChat<{
      summary: string;
      insights: string;
    }>(weeklyPrompt, true, "mixtral-8x7b-32768");

    if (!weeklyResult) {
      console.error(`Failed to generate weekly summary for user ${userId}`);
      return null;
    }

    return {
      summary: weeklyResult.summary || "No summary generated.",
      insights: weeklyResult.insights || "",
    };
  } catch (error: any) {
    console.error(`Error processing weekly summary for user ${userId}:`, error);
    return null;
  }
}

