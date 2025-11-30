import { createClient } from "@supabase/supabase-js";
import { buildMonthlyPrompt } from "./prompts";
import { runGroqChat } from "./groq";

interface MonthlyResult {
  summary: string;
  insights: string;
}

/**
 * Process monthly summary for a user
 * Fetches weekly summaries, generates AI monthly summary
 * Does NOT write to database - returns structured result
 */
export async function runMonthly(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string,
  month: string
): Promise<MonthlyResult | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate month start and end dates
    const monthDate = new Date(month);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);

    // Fetch weekly summaries from the past month
    const { data: weeklySummaries, error: summariesError } = await supabase
      .from("weekly_summaries")
      .select("summary, insights")
      .eq("user_id", userId)
      .gte("week_start", monthStart.toISOString().split("T")[0])
      .lt("week_start", monthEnd.toISOString().split("T")[0])
      .order("week_start", { ascending: true });

    if (summariesError) {
      console.error(`Error fetching weekly summaries for user ${userId}:`, summariesError);
      return null;
    }

    if (!weeklySummaries || weeklySummaries.length === 0) {
      console.log(`No weekly summaries found for user ${userId} for month ${month}`);
      return null;
    }

    // Generate monthly summary prompt
    const monthlyPrompt = buildMonthlyPrompt(weeklySummaries);

    // Call Groq for monthly summary
    const monthlyResult = await runGroqChat<{
      summary: string;
      insights: string;
    }>(monthlyPrompt, true, "mixtral-8x7b-32768");

    if (!monthlyResult) {
      console.error(`Failed to generate monthly summary for user ${userId}`);
      return null;
    }

    return {
      summary: monthlyResult.summary || "No summary generated.",
      insights: monthlyResult.insights || "",
    };
  } catch (error: any) {
    console.error(`Error processing monthly summary for user ${userId}:`, error);
    return null;
  }
}

