import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Groq from "npm:groq-sdk@^0.3.0";

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

    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = [];
    const today = new Date();
    
    // Calculate previous week (Monday to Sunday)
    // If today is Monday, we want to summarize last week (Monday to Sunday)
    // If today is any other day, we still want to summarize the most recent completed week
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const weekStart = new Date(today);
    
    // Calculate last Monday (start of previous completed week)
    // If today is Monday, go back 7 days. Otherwise, go back to the most recent Monday
    if (dayOfWeek === 1) {
      // Today is Monday, go back 7 days to get last Monday
      weekStart.setDate(today.getDate() - 7);
    } else if (dayOfWeek === 0) {
      // Today is Sunday, go back 6 days to get last Monday
      weekStart.setDate(today.getDate() - 6);
    } else {
      // Any other day, go back (dayOfWeek - 1) + 7 days to get last Monday
      weekStart.setDate(today.getDate() - (dayOfWeek - 1) - 7);
    }
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split("T")[0];
    
    // Calculate end of that week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    for (const user of users.users) {
      try {
        // Check if weekly summary already exists for this week
        const { data: existingSummary } = await supabase
          .from("weekly_summaries")
          .select("id")
          .eq("user_id", user.id)
          .eq("week_start", weekStartStr)
          .single();

        if (existingSummary) {
          results.push({
            user_id: user.id,
            status: "skipped",
            reason: "Weekly summary already exists for this week",
          });
          continue;
        }

        // Fetch daily summaries from that week (last 7 days)
        const { data: dailySummaries, error: summariesError } = await supabase
          .from("daily_summaries")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", weekStartStr)
          .lte("date", weekEnd.toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (summariesError || !dailySummaries || dailySummaries.length === 0) {
          continue;
        }

        // Build prompt
        const summariesText = dailySummaries
          .map(
            (summary, index) =>
              `Day ${index + 1}: ${summary.summary} (Focus: ${summary.focus_score || "N/A"})`
          )
          .join("\n\n");

        const avgFocus =
          dailySummaries
            .filter((s) => s.focus_score)
            .reduce((sum, s) => sum + (s.focus_score || 0), 0) /
          dailySummaries.filter((s) => s.focus_score).length;

        const prompt = `Weekly Activity Summary (${dailySummaries.length} days):

${summariesText}

Average Focus Score: ${avgFocus ? avgFocus.toFixed(0) : "N/A"}

Generate a JSON response:
{
  "summary": "A concise paragraph summarizing the week's productivity patterns and trends",
  "insights": "3-5 key insights about productivity patterns, best focus hours, recurring distractions, or improvement opportunities"
}

Return ONLY valid JSON, no markdown or extra text.`;

        // Call Groq
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are a productivity coach analyzing a week of daily summaries. Identify patterns, trends, and improvement opportunities. Keep responses concise and actionable.",
            },
            { role: "user", content: prompt },
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 600,
        });

        const aiResponse = completion.choices[0]?.message?.content || "";

        // Parse JSON
        let summaryData: { summary: string; insights?: string } = {
          summary: "No summary generated.",
        };

        try {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
          summaryData = JSON.parse(jsonString);
        } catch (parseError) {
          summaryData = {
            summary: aiResponse.substring(0, 600),
            insights: "AI parsing error occurred.",
          };
        }

        // Insert weekly summary
        // Force update timestamps to ensure notifications work
        const now = new Date().toISOString();
        const { error: upsertError } = await supabase
          .from("weekly_summaries")
          .upsert(
            {
              user_id: user.id,
              week_start: weekStartStr,
              summary: summaryData.summary,
              insights: summaryData.insights || null,
              created_at: now,
              updated_at: now,
            },
            { onConflict: "user_id,week_start" }
          );

        if (upsertError) {
          console.error(`Error upserting weekly summary for user ${user.id}:`, upsertError);
          results.push({ 
            user_id: user.id, 
            status: "error", 
            error: upsertError.message 
          });
        } else {
          console.log(`✅ Weekly summary generated for user ${user.id} (${weekStartStr})`);
          results.push({ 
            user_id: user.id, 
            status: "success",
            week_start: weekStartStr,
            notification_ready: true,
          });
        }
      } catch (userError: any) {
        console.error(`Error processing user ${user.id}:`, userError);
        results.push({ user_id: user.id, status: "error", error: userError.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

