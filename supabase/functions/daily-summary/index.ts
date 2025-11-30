import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Groq from "npm:groq-sdk@^0.3.0";

interface ActivityLog {
  activity: string;
  start_time: string;
  end_time: string | null;
  category_id: string | null;
  categories?: { name: string; color: string } | null;
}

interface FocusMetrics {
  totalWorkTime: number;
  deepWorkTime: number;
  contextSwitches: number;
  longestWorkBlock: number;
  averageBlockDuration: number;
  breakFrequency: number;
  idleGaps: number;
}

interface UserSettings {
  ai_summary_time: string | null; // "HH:mm" format
  notifications_enabled: boolean;
}

// Compress logs for AI processing
function compressLogs(logs: ActivityLog[]): string {
  return logs
    .map((log) => {
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
}

// Calculate focus metrics
function calculateMetrics(logs: ActivityLog[]): FocusMetrics {
  if (logs.length === 0) {
    return {
      totalWorkTime: 0,
      deepWorkTime: 0,
      contextSwitches: 0,
      longestWorkBlock: 0,
      averageBlockDuration: 0,
      breakFrequency: 0,
      idleGaps: 0,
    };
  }

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  let totalWorkTime = 0;
  let deepWorkTime = 0;
  let contextSwitches = 0;
  let longestWorkBlock = 0;
  const workBlocks: number[] = [];
  let currentWorkBlock = 0;
  let breaks = 0;
  let idleGaps = 0;

  const workCategories = ["Work", "Deep Work", "Coding", "Learning"];
  const breakCategories = ["Break", "Rest"];

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];
    const start = new Date(log.start_time).getTime();
    const end = log.end_time ? new Date(log.end_time).getTime() : Date.now();
    const duration = Math.floor((end - start) / (1000 * 60));

    const categoryName = log.categories?.name || "";
    const isWork = workCategories.some((cat) =>
      categoryName.toLowerCase().includes(cat.toLowerCase())
    );
    const isDeepWork = categoryName.toLowerCase().includes("deep");
    const isBreak = breakCategories.some((cat) =>
      categoryName.toLowerCase().includes(cat.toLowerCase())
    );

    if (isWork) {
      totalWorkTime += duration;
      if (isDeepWork) {
        deepWorkTime += duration;
      }
      currentWorkBlock += duration;

      if (i > 0) {
        const prevLog = sortedLogs[i - 1];
        const prevCategory = prevLog.categories?.name || "";
        const wasWork = workCategories.some((cat) =>
          prevCategory.toLowerCase().includes(cat.toLowerCase())
        );
        if (wasWork && prevCategory !== categoryName) {
          contextSwitches++;
          if (currentWorkBlock > 0) {
            workBlocks.push(currentWorkBlock);
            currentWorkBlock = 0;
          }
        }
      }
    } else {
      if (currentWorkBlock > 0) {
        workBlocks.push(currentWorkBlock);
        currentWorkBlock = 0;
      }
      if (isBreak) breaks++;
      if (i > 0 && duration > 30) idleGaps++;
    }
  }

  if (currentWorkBlock > 0) workBlocks.push(currentWorkBlock);

  const averageBlockDuration =
    workBlocks.length > 0
      ? workBlocks.reduce((sum, block) => sum + block, 0) / workBlocks.length
      : 0;

  longestWorkBlock = workBlocks.length > 0 ? Math.max(...workBlocks) : 0;

  const workHours = totalWorkTime / 60;
  const breakFrequency = workHours > 0 ? breaks / workHours : 0;

  return {
    totalWorkTime,
    deepWorkTime,
    contextSwitches,
    longestWorkBlock,
    averageBlockDuration,
    breakFrequency,
    idleGaps,
  };
}

// Calculate deterministic focus score
function calculateFocusScore(metrics: FocusMetrics): number {
  if (metrics.totalWorkTime === 0) return 0;

  let score = 50;
  const deepWorkRatio = metrics.deepWorkTime / metrics.totalWorkTime;
  score += deepWorkRatio * 20;

  if (metrics.longestWorkBlock >= 120) score += 15;
  else if (metrics.longestWorkBlock >= 60) score += 10;
  else if (metrics.longestWorkBlock >= 30) score += 5;

  if (metrics.averageBlockDuration >= 60) score += 10;
  else if (metrics.averageBlockDuration >= 30) score += 5;

  if (metrics.contextSwitches > 10) score -= 20;
  else if (metrics.contextSwitches > 5) score -= 10;
  else if (metrics.contextSwitches > 2) score -= 5;

  score -= Math.min(metrics.idleGaps * 5, 15);

  if (metrics.breakFrequency >= 0.5 && metrics.breakFrequency <= 2) {
    score += 10;
  } else if (metrics.breakFrequency > 2) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// Check if current time has reached or passed user's AI summary time
// Returns true if we should generate summary NOW
function isTimeForSummary(userTime: string | null, currentTime: Date): boolean {
  if (!userTime) {
    // Default to 22:00 (10 PM) if not set
    userTime = "22:00";
  }

  const [targetHour, targetMinute] = userTime.split(":").map(Number);
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  // Convert to minutes since midnight for easier comparison
  const targetMinutes = targetHour * 60 + targetMinute;
  const currentMinutes = currentHour * 60 + currentMinute;

  // Check if we're past the target time today
  // Allow a 60-minute window (since function runs hourly at :00, it will catch any time in that hour)
  // If function runs at 22:00, it will catch users with ai_summary_time between 22:00-22:59
  const minutesSinceTarget = currentMinutes - targetMinutes;
  
  // Generate if we're past the target time AND within 60 minutes of it
  // This ensures the hourly cron job catches all users' summary times
  return minutesSinceTarget >= 0 && minutesSinceTarget < 60;
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const groqApiKey = Deno.env.get("GROQ_API_KEY")!;

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const groq = new Groq({ apiKey: groqApiKey });

    const currentTime = new Date();
    const results = [];

    // Get all users with their settings
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Process each user
    for (const user of users.users) {
      try {
        // Fetch user settings to get ai_summary_time
        const { data: settings } = await supabase
          .from("user_settings")
          .select("ai_summary_time, notifications_enabled")
          .eq("user_id", user.id)
          .single();

        const userSettings: UserSettings = {
          ai_summary_time: settings?.ai_summary_time || "22:00",
          notifications_enabled: settings?.notifications_enabled ?? true,
        };

        // Check if summary already generated today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateStr = today.toISOString().split("T")[0];

        const { data: existingSummary } = await supabase
          .from("daily_summaries")
          .select("id, created_at")
          .eq("user_id", user.id)
          .eq("date", dateStr)
          .single();

        if (existingSummary) {
          // Summary already generated today, skip
          results.push({
            user_id: user.id,
            status: "skipped",
            reason: "Summary already exists for today",
          });
          continue;
        }

        // Check if it's time for this user's summary
        if (!isTimeForSummary(userSettings.ai_summary_time, currentTime)) {
          // Not time yet - skip this user
          continue;
        }

        // Fetch today's logs
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

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
          console.error(`Error fetching logs for user ${user.id}:`, logsError);
          continue;
        }

        if (!logs || logs.length === 0) {
          // Skip users with no logs today
          results.push({
            user_id: user.id,
            status: "skipped",
            reason: "No logs today",
          });
          continue;
        }

        // Calculate metrics
        const metrics = calculateMetrics(logs as ActivityLog[]);
        const focusScore = calculateFocusScore(metrics);

        // Build AI prompt
        const compressedLogs = compressLogs(logs as ActivityLog[]);
        const totalHours = (metrics.totalWorkTime / 60).toFixed(1);

        const prompt = `Today's Activity Log (${logs.length} activities, ${totalHours}h total work time):

${compressedLogs}

Metrics:
- Deep work: ${(metrics.deepWorkTime / 60).toFixed(1)}h
- Context switches: ${metrics.contextSwitches}
- Longest work block: ${metrics.longestWorkBlock} minutes
- Average block: ${metrics.averageBlockDuration.toFixed(0)} minutes

Generate a JSON response:
{
  "summary": "A concise paragraph summarizing the day's activities and productivity patterns",
  "insights": "2-3 key insights about productivity, focus, or time management patterns"
}

Return ONLY valid JSON, no markdown or extra text.`;

        // Call Groq AI
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

        const aiResponse = completion.choices[0]?.message?.content || "";

        // Parse JSON response
        let summaryData: { summary: string; insights?: string } = {
          summary: "No summary generated.",
        };

        try {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
          summaryData = JSON.parse(jsonString);
        } catch (parseError) {
          // Fallback: use raw response as summary
          summaryData = {
            summary: aiResponse.substring(0, 500),
            insights: "AI parsing error occurred.",
          };
        }

        // Insert or update daily summary
        // Force update timestamps to ensure notifications work
        const now = new Date().toISOString();
        const { error: upsertError } = await supabase
          .from("daily_summaries")
          .upsert(
            {
              user_id: user.id,
              date: dateStr,
              summary: summaryData.summary,
              focus_score: focusScore,
              insights: summaryData.insights || null,
              created_at: now,
              updated_at: now,
            },
            { onConflict: "user_id,date" }
          );

        if (upsertError) {
          console.error(
            `Error upserting summary for user ${user.id}:`,
            upsertError
          );
          results.push({
            user_id: user.id,
            status: "error",
            error: upsertError.message,
          });
          continue;
        }

        // Mark summary as ready for notification
        // The frontend will check for new summaries and show notification
        console.log(`✅ Daily summary generated for user ${user.id} (${dateStr}) - Focus Score: ${focusScore}`);
        results.push({
          user_id: user.id,
          status: "success",
          focus_score: focusScore,
          summary_date: dateStr,
          notification_ready: true,
          notifications_enabled: userSettings.notifications_enabled,
        });
      } catch (userError: any) {
        console.error(`Error processing user ${user.id}:`, userError);
        results.push({
          user_id: user.id,
          status: "error",
          error: userError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        current_time: currentTime.toISOString(),
        results,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Daily summary error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
