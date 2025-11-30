interface ActivityLog {
  activity: string;
  start_time: string;
  end_time: string | null;
  category?: string | null;
  categories?: { name: string } | null;
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

interface DailySummary {
  summary: string;
  focus_score?: number;
  insights?: string;
}

/**
 * Aggregate logs into compact statistics
 */
function aggregateLogs(logs: ActivityLog[]) {
  const categoryTime: Record<string, number> = {};
  const taskBlocks: Array<{ activity: string; duration: number; category: string }> = [];

  logs.forEach((log) => {
    const category = log.categories?.name || log.category || "Other";
    const start = new Date(log.start_time).getTime();
    const end = log.end_time ? new Date(log.end_time).getTime() : Date.now();
    const duration = Math.floor((end - start) / (1000 * 60)); // minutes

    categoryTime[category] = (categoryTime[category] || 0) + duration;

    if (duration > 0) {
      taskBlocks.push({ activity: log.activity, duration, category });
    }
  });

  // Top 3 categories by time
  const topCategories = Object.entries(categoryTime)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, minutes]) => `${name}: ${(minutes / 60).toFixed(1)}h`);

  // Biggest task blocks (sorted by duration)
  const biggestBlocks = taskBlocks
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 3)
    .map((block) => `${block.activity} [${block.category}] (${block.duration}min)`);

  return {
    totalActivities: logs.length,
    topCategories,
    biggestBlocks,
    totalMinutes: Object.values(categoryTime).reduce((sum, min) => sum + min, 0),
  };
}

/**
 * Build compact daily summary prompt
 */
export function buildDailyPrompt(logs: ActivityLog[], metrics: FocusMetrics): string {
  const aggregated = aggregateLogs(logs);
  const totalHours = (aggregated.totalMinutes / 60).toFixed(1);

  return `Analyze today's productivity data:

**Aggregated Totals:**
- Total activities: ${aggregated.totalActivities}
- Total time: ${totalHours}h
- Deep work: ${(metrics.deepWorkTime / 60).toFixed(1)}h
- Context switches: ${metrics.contextSwitches}
- Longest work block: ${metrics.longestWorkBlock}min
- Average block: ${metrics.averageBlockDuration.toFixed(0)}min

**Top 3 Categories:**
${aggregated.topCategories.map((cat) => `- ${cat}`).join("\n")}

**Biggest Task Blocks:**
${aggregated.biggestBlocks.map((block) => `- ${block}`).join("\n")}

Generate a JSON response:
{
  "summary": "Concise daily summary paragraph (100-150 words)",
  "focus_score": <number 0-100>,
  "insights": "2-3 key insights about productivity patterns"
}`;
}

/**
 * Build compact weekly summary prompt
 */
export function buildWeeklyPrompt(dailySummaries: DailySummary[]): string {
  const avgFocus =
    dailySummaries
      .filter((s) => s.focus_score)
      .reduce((sum, s) => sum + (s.focus_score || 0), 0) /
    (dailySummaries.filter((s) => s.focus_score).length || 1);

  const summaries = dailySummaries
    .map((s, i) => `Day ${i + 1} (Focus: ${s.focus_score || "N/A"}): ${s.summary.substring(0, 100)}...`)
    .join("\n");

  return `Analyze weekly productivity patterns from ${dailySummaries.length} days:

**Weekly Overview:**
${summaries}

**Average Focus Score:** ${avgFocus.toFixed(0)}

Generate a JSON response:
{
  "summary": "Weekly summary paragraph (150-200 words)",
  "insights": "3-5 insights about patterns, best hours, distractions, improvements"
}`;
}

/**
 * Build compact monthly summary prompt
 */
export function buildMonthlyPrompt(weeklySummaries: Array<{ summary: string; insights?: string }>): string {
  const summaries = weeklySummaries
    .map((s, i) => `Week ${i + 1}: ${s.summary.substring(0, 120)}...`)
    .join("\n\n");

  return `Analyze monthly productivity trends from ${weeklySummaries.length} weeks:

**Monthly Overview:**
${summaries}

Generate a JSON response:
{
  "summary": "Monthly summary paragraph (200-250 words)",
  "insights": "4-6 strategic insights about trends, optimizations, high-impact tasks"
}`;
}

/**
 * Build focus score prompt from metrics only
 */
export function buildFocusPrompt(metrics: FocusMetrics): string {
  return `Calculate focus score (0-100) from metrics:

- Total work: ${(metrics.totalWorkTime / 60).toFixed(1)}h
- Deep work: ${(metrics.deepWorkTime / 60).toFixed(1)}h
- Context switches: ${metrics.contextSwitches}
- Longest block: ${metrics.longestWorkBlock}min
- Avg block: ${metrics.averageBlockDuration.toFixed(0)}min
- Break frequency: ${metrics.breakFrequency.toFixed(1)}/hr
- Idle gaps: ${metrics.idleGaps}

Return JSON: {"focus_score": <number 0-100>}`;
}
