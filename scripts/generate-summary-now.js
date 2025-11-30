/**
 * Script to generate AI summary for current user immediately
 * Run with: node scripts/generate-summary-now.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

async function generateSummary() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  if (!groqApiKey) {
    console.error('❌ Missing GROQ_API_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const groq = new Groq({ apiKey: groqApiKey });

  console.log('🔍 Fetching users...');
  
  // Get all users
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    process.exit(1);
  }

  if (!usersData || usersData.users.length === 0) {
    console.log('❌ No users found');
    process.exit(1);
  }

  // Get the first user (you can modify this to target a specific user)
  const user = usersData.users[0];
  console.log(`✅ Found user: ${user.email || user.id}`);

  // Get today's logs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = today.toISOString().split('T')[0];

  console.log('📊 Fetching today\'s logs...');
  
  const { data: logs, error: logsError } = await supabase
    .from('activity_logs')
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
    .eq('user_id', user.id)
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .order('start_time', { ascending: true });

  if (logsError) {
    console.error('❌ Error fetching logs:', logsError);
    process.exit(1);
  }

  if (!logs || logs.length === 0) {
    console.log('❌ No logs found for today. Please log some activities first.');
    process.exit(1);
  }

  console.log(`✅ Found ${logs.length} logs for today`);

  // Check if summary already exists
  const { data: existingSummary } = await supabase
    .from('daily_summaries')
    .select('id, date')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .single();

  if (existingSummary) {
    console.log('⚠️  Summary already exists for today. It will be updated.');
  }

  // Calculate metrics
  let totalWorkTime = 0;
  let deepWorkTime = 0;
  let contextSwitches = 0;
  const workCategories = ['Work', 'Deep Work', 'Coding', 'Learning'];

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const start = new Date(log.start_time).getTime();
    const end = log.end_time ? new Date(log.end_time).getTime() : Date.now();
    const duration = Math.floor((end - start) / (1000 * 60));

    const categoryName = log.categories?.name || '';
    const isWork = workCategories.some((cat) =>
      categoryName.toLowerCase().includes(cat.toLowerCase())
    );
    const isDeepWork = categoryName.toLowerCase().includes('deep');

    if (isWork) {
      totalWorkTime += duration;
      if (isDeepWork) deepWorkTime += duration;
      if (i > 0 && logs[i - 1].categories?.name !== categoryName) {
        contextSwitches++;
      }
    }
  }

  // Calculate focus score
  let focusScore = 50;
  if (totalWorkTime > 0) {
    const deepWorkRatio = deepWorkTime / totalWorkTime;
    focusScore += deepWorkRatio * 20;
    if (contextSwitches < 5) focusScore += 15;
    else if (contextSwitches < 10) focusScore += 5;
    else focusScore -= 10;
  }
  focusScore = Math.max(0, Math.min(100, Math.round(focusScore)));

  // Compress logs for AI
  const compressedLogs = logs
    .map((log) => {
      const category = log.categories?.name || 'Other';
      const start = new Date(log.start_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const end = log.end_time
        ? new Date(log.end_time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : 'ongoing';
      const duration = log.end_time
        ? Math.round(
            (new Date(log.end_time).getTime() -
              new Date(log.start_time).getTime()) /
              (1000 * 60)
          )
        : 'ongoing';
      return `${start}-${end} (${duration}min): ${log.activity} [${category}]`;
    })
    .join('\n');

  const totalHours = (totalWorkTime / 60).toFixed(1);

  // Generate AI summary
  console.log('🤖 Generating AI summary with Groq...');
  
  const prompt = `Today's Activity Log (${logs.length} activities, ${totalHours}h total work time):

${compressedLogs}

Metrics:
- Deep work: ${(deepWorkTime / 60).toFixed(1)}h
- Context switches: ${contextSwitches}
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
          role: 'system',
          content:
            'You are a productivity coach analyzing someone\'s daily activity log. Generate a concise, insightful daily summary. Keep it under 150 words.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    // Parse JSON response
    let summaryData = { summary: 'No summary generated.', insights: null };

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      summaryData = JSON.parse(jsonString);
    } catch (parseError) {
      summaryData = {
        summary: aiResponse.substring(0, 500),
        insights: 'AI parsing error occurred.',
      };
    }

    console.log('💾 Saving summary to database...');

    // Upsert summary
    const { data: summary, error: upsertError } = await supabase
      .from('daily_summaries')
      .upsert(
        {
          user_id: user.id,
          date: dateStr,
          summary: summaryData.summary,
          focus_score: focusScore,
          insights: summaryData.insights || null,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('❌ Error saving summary:', upsertError);
      process.exit(1);
    }

    console.log('\n✅ AI Summary Generated Successfully!');
    console.log(`\n📊 Focus Score: ${focusScore}`);
    console.log(`\n📝 Summary:\n${summaryData.summary}`);
    if (summaryData.insights) {
      console.log(`\n💡 Insights:\n${summaryData.insights}`);
    }
    console.log(`\n✅ Summary saved for date: ${dateStr}`);
    console.log('\n🎉 Done! Refresh your dashboard to see the summary.');

  } catch (error) {
    console.error('❌ Error generating summary:', error);
    process.exit(1);
  }
}

generateSummary();

