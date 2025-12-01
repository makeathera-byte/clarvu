import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { logEvent } from "@/lib/analytics/logEvent";
import { logError } from "@/lib/analytics/logError";
import { logSlowRoute } from "@/lib/analytics/logSlowRoute";
import Groq from "groq-sdk";

interface ActivityLog {
  activity: string;
  start_time: string;
  end_time: string | null;
  category_id: string | null;
  categories?: { name: string; color: string } | null;
}

/**
 * Direct endpoint to generate AI summary for current user immediately
 * Bypasses time checks - generates summary right away
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserOrThrow();
    const supabase = await createClient();

    // Check Groq API key
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return errorResponse("GROQ_API_KEY not configured", 500);
    }

    const groq = new Groq({ apiKey: groqApiKey });

    // Get today's logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = today.toISOString().split("T")[0];

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
      .eq("user_id", user.id)
      .gte("start_time", today.toISOString())
      .lt("start_time", tomorrow.toISOString())
      .order("start_time", { ascending: true });

    if (logsError) {
      return errorResponse(`Error fetching logs: ${logsError.message}`, 500);
    }

    if (!logs || logs.length === 0) {
      return errorResponse("No logs found for today. Please log some activities first.", 400);
    }

    // Calculate metrics (simplified version)
    const calculateMetrics = (logs: ActivityLog[]) => {
      let totalWorkTime = 0;
      let deepWorkTime = 0;
      let contextSwitches = 0;
      const workBlocks: number[] = [];

      const workCategories = ["Work", "Deep Work", "Coding", "Learning"];

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const start = new Date(log.start_time).getTime();
        const end = log.end_time ? new Date(log.end_time).getTime() : Date.now();
        const duration = Math.floor((end - start) / (1000 * 60));

        const categoryName = log.categories?.name || "";
        const isWork = workCategories.some((cat) =>
          categoryName.toLowerCase().includes(cat.toLowerCase())
        );
        const isDeepWork = categoryName.toLowerCase().includes("deep");

        if (isWork) {
          totalWorkTime += duration;
          if (isDeepWork) deepWorkTime += duration;
          if (i > 0 && logs[i - 1].categories?.name !== categoryName) {
            contextSwitches++;
          }
        }
      }

      return { totalWorkTime, deepWorkTime, contextSwitches };
    };

    const metrics = calculateMetrics(logs as ActivityLog[]);
    
    // Calculate focus score (simplified)
    let focusScore = 50;
    if (metrics.totalWorkTime > 0) {
      const deepWorkRatio = metrics.deepWorkTime / metrics.totalWorkTime;
      focusScore += deepWorkRatio * 20;
      if (metrics.contextSwitches < 5) focusScore += 15;
      else if (metrics.contextSwitches < 10) focusScore += 5;
      else focusScore -= 10;
    }
    focusScore = Math.max(0, Math.min(100, Math.round(focusScore)));

    // Compress logs for AI
    const compressedLogs = logs
      .map((log: ActivityLog) => {
        const category = log.categories?.name || "Other";
        const start = new Date(log.start_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const end = log.end_time
          ? new Date(log.end_time).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "ongoing";
        const duration = log.end_time
          ? Math.round(
              (new Date(log.end_time).getTime() -
                new Date(log.start_time).getTime()) /
                (1000 * 60)
            )
          : "ongoing";
        return `${start}-${end} (${duration}min): ${log.activity} [${category}]`;
      })
      .join("\n");

    const totalHours = (metrics.totalWorkTime / 60).toFixed(1);

    // Generate AI summary (track timing)
    const aiStartTime = Date.now();
    let aiResponse = "";
    let aiResponseTime = 0;
    const prompt = `Today's Activity Log (${logs.length} activities, ${totalHours}h total work time):

${compressedLogs}

Metrics:
- Deep work: ${(metrics.deepWorkTime / 60).toFixed(1)}h
- Context switches: ${metrics.contextSwitches}
- Focus score: ${focusScore}

Generate a JSON response:
{
  "summary": "A concise paragraph summarizing the day's activities and productivity patterns",
  "insights": "2-3 key insights about productivity, focus, or time management patterns"
}

Return ONLY valid JSON, no markdown or extra text.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a productivity coach analyzing someone's daily activity log. Generate a concise, insightful daily summary. Keep it under 150 words.",
          },
          { role: "user", content: prompt },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 500,
      });
      
      aiResponseTime = Date.now() - aiStartTime;
      aiResponse = completion.choices[0]?.message?.content || "";
      
      // Log successful AI API call
      try {
        await logEvent(user.id, "ai_api_request", aiResponseTime);
        await logEvent(user.id, "groq_api_success", aiResponseTime);
        if (aiResponseTime > 1000) {
          await logSlowRoute(user.id, "groq_api", aiResponseTime);
        }
      } catch (logError) {
        console.error("Error logging AI API call:", logError);
      }
    } catch (aiError: any) {
      aiResponseTime = Date.now() - aiStartTime;
      // Log AI API error
      try {
        await logError(user.id, "ai_error", `Groq API error: ${aiError.message}`);
        await logError(user.id, "groq_api_error", aiError.message);
      } catch (logError) {
        console.error("Error logging AI error:", logError);
      }
      throw aiError;
    }

    // Parse JSON response
    let summaryData: { summary: string; insights?: string } = {
      summary: "No summary generated.",
    };

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      summaryData = JSON.parse(jsonString);
    } catch (parseError) {
      summaryData = {
        summary: aiResponse.substring(0, 500),
        insights: "AI parsing error occurred.",
      };
    }

    // Upsert summary
    const { data: summary, error: upsertError } = await supabase
      .from("daily_summaries")
      .upsert(
        {
          user_id: user.id,
          date: dateStr,
          summary: summaryData.summary,
          focus_score: focusScore,
          insights: summaryData.insights || null,
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();

    if (upsertError) {
      return errorResponse(
        `Error saving summary: ${upsertError.message}`,
        500
      );
    }

    // Log summary generation event
    try {
      await logEvent(user.id, "summary_generated");
      console.log("✅ Logged summary_generated event for user:", user.id);
    } catch (logError) {
      console.error("❌ Error logging summary generation:", logError);
      // Don't fail the request if logging fails
    }

    return successResponse({
      message: "AI summary generated successfully!",
      summary: {
        id: summary.id,
        date: summary.date,
        focus_score: summary.focus_score,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    
    // Log error (try to get user, but don't fail if we can't)
    try {
      try {
        const user = await getUserOrThrow();
        await logError(user.id, "api_error", `generate-summary: ${error.message}`);
      } catch {
        // If we can't get user, log as system error
        await logError(null, "api_error", `generate-summary: ${error.message}`);
      }
    } catch (logError) {
      console.error("Error logging API error:", logError);
    }
    
    console.error("Error generating summary:", error);
    return errorResponse(error.message || "Failed to generate summary", 500);
  }
}

