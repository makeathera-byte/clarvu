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
    
    // Calculate current month start
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

    for (const user of users.users) {
      try {
        // Check if monthly summary already exists for this month
        const { data: existingSummary } = await supabase
          .from("monthly_summaries")
          .select("id")
          .eq("user_id", user.id)
          .eq("month", monthStr)
          .single();

        if (existingSummary) {
          results.push({
            user_id: user.id,
            status: "skipped",
            reason: "Monthly summary already exists for this month",
          });
          continue;
        }

        // Fetch weekly summaries from the previous month
        const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        previousMonthStart.setHours(0, 0, 0, 0);
        
        // Fetch weekly summaries from previous month (to summarize)
        const { data: weeklySummaries, error: summariesError } = await supabase
          .from("weekly_summaries")
          .select("*")
          .eq("user_id", user.id)
          .gte("week_start", previousMonthStart.toISOString().split("T")[0])
          .lt("week_start", monthStart.toISOString().split("T")[0])
          .order("week_start", { ascending: true });

        if (summariesError || !weeklySummaries || weeklySummaries.length === 0) {
          continue;
        }

        // Build prompt
        const summariesText = weeklySummaries
          .map((summary, index) => `Week ${index + 1}:\n${summary.summary}`)
          .join("\n\n");

        const prompt = `Monthly Summary (${weeklySummaries.length} weeks):

${summariesText}

Generate a JSON response:
{
  "summary": "A concise paragraph summarizing the month's productivity trends and overall patterns",
  "insights": "4-6 strategic insights about productivity trends, improvement suggestions, focus-time optimization, and high-impact task patterns"
}

Return ONLY valid JSON, no markdown or extra text.`;

        // Call Groq
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are a productivity coach analyzing a month of weekly summaries. Provide high-level insights, trends, and strategic recommendations.",
            },
            { role: "user", content: prompt },
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 800,
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
            summary: aiResponse.substring(0, 800),
            insights: "AI parsing error occurred.",
          };
        }

        // Insert monthly summary
        // Force update timestamps to ensure notifications work
        const now = new Date().toISOString();
        const { error: upsertError } = await supabase
          .from("monthly_summaries")
          .upsert(
            {
              user_id: user.id,
              month: monthStr,
              summary: summaryData.summary,
              insights: summaryData.insights || null,
              created_at: now,
              updated_at: now,
            },
            { onConflict: "user_id,month" }
          );

        if (upsertError) {
          console.error(`Error upserting monthly summary for user ${user.id}:`, upsertError);
          results.push({ 
            user_id: user.id, 
            status: "error", 
            error: upsertError.message 
          });
        } else {
          console.log(`✅ Monthly summary generated for user ${user.id} (${monthStr})`);
          results.push({ 
            user_id: user.id, 
            status: "success",
            month: monthStr,
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

