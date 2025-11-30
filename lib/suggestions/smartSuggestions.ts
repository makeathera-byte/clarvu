import { ActivityEvent } from "@/components/monitor/BrowserActivityMonitor";
import { detectContext } from "@/lib/context/detector";

export interface SmartSuggestion {
  activity: string;
  categoryId: string | null;
  confidence: number;
  reason: string;
  source: "context" | "history" | "time" | "pattern";
}

interface ActivityHistory {
  activity: string;
  category_id: string | null;
  start_time: string;
  end_time: string | null;
}

interface SmartContext {
  currentContext: ActivityEvent;
  history: ActivityHistory[];
  currentHour: number;
  previousActivity: string | null;
}

/**
 * Smart Suggestions Engine 2.0
 * Context-aware, pattern-recognition based suggestions
 */

/**
 * Get smart suggestions based on context and history
 */
export async function getSmartSuggestions(
  context: SmartContext
): Promise<SmartSuggestion[]> {
  const suggestions: SmartSuggestion[] = [];

  // 1. Context-based suggestions (active tab detection)
  const contextDetection = detectContext(
    context.currentContext.activeTab,
    context.currentContext.isIdle
  );

  if (contextDetection.likelyTask && contextDetection.confidence >= 60) {
    suggestions.push({
      activity: contextDetection.likelyTask,
      categoryId: contextDetection.categoryId,
      confidence: contextDetection.confidence,
      reason: contextDetection.reason,
      source: "context",
    });
  }

  // 2. Time-of-day suggestions
  const timeSuggestions = getTimeOfDaySuggestions(context.currentHour, context.history);
  suggestions.push(...timeSuggestions);

  // 3. Pattern-based suggestions (last 10 tasks)
  const patternSuggestions = getPatternSuggestions(context.history);
  suggestions.push(...patternSuggestions);

  // 4. Resuming previous task
  const resumeSuggestion = getResumeSuggestion(context.previousActivity);
  if (resumeSuggestion) {
    suggestions.push(resumeSuggestion);
  }

  // Deduplicate and sort by confidence
  const uniqueSuggestions = deduplicateSuggestions(suggestions);
  return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Get time-of-day based suggestions
 * Example: If user usually codes at 11AM, suggest coding around that time
 */
function getTimeOfDaySuggestions(
  currentHour: number,
  history: ActivityHistory[]
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  if (history.length === 0) return suggestions;

  // Group activities by hour
  const hourlyPatterns: Record<number, Record<string, number>> = {};

  history.forEach((log) => {
    if (!log.start_time) return;
    const startDate = new Date(log.start_time);
    const hour = startDate.getHours();
    const activity = log.activity;

    if (!hourlyPatterns[hour]) {
      hourlyPatterns[hour] = {};
    }
    if (!hourlyPatterns[hour][activity]) {
      hourlyPatterns[hour][activity] = 0;
    }
    hourlyPatterns[hour][activity]++;
  });

  // Check if there's a pattern for current hour (±1 hour window)
  for (let offset = -1; offset <= 1; offset++) {
    const checkHour = (currentHour + offset + 24) % 24;
    const patterns = hourlyPatterns[checkHour];

    if (patterns) {
      // Find most common activity at this hour
      const sortedActivities = Object.entries(patterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);

      sortedActivities.forEach(([activity, count], index) => {
        if (count >= 2) {
          // At least 2 occurrences to be a pattern
          const confidence = Math.min(60 + count * 5, 85); // Max 85% for time-based
          suggestions.push({
            activity,
            categoryId: null,
            confidence: confidence - Math.abs(offset) * 10, // Lower confidence if not exact hour
            reason: `You usually ${activity} around ${checkHour}:00`,
            source: "time",
          });
        }
      });
    }
  }

  return suggestions;
}

/**
 * Get pattern-based suggestions from last 10 tasks
 */
function getPatternSuggestions(history: ActivityHistory[]): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  if (history.length === 0) return suggestions;

  // Get last 10 activities
  const recent = history.slice(0, 10);
  
  // Find most common activities
  const activityCounts: Record<string, number> = {};
  
  recent.forEach((log) => {
    const activity = log.activity;
    activityCounts[activity] = (activityCounts[activity] || 0) + 1;
  });

  // Suggest frequently repeated activities
  Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([activity, count]) => {
      if (count >= 2) {
        suggestions.push({
          activity,
          categoryId: null,
          confidence: Math.min(50 + count * 5, 75),
          reason: `You've done this ${count} times recently`,
          source: "pattern",
        });
      }
    });

  return suggestions;
}

/**
 * Get suggestion for resuming previous activity
 */
function getResumeSuggestion(previousActivity: string | null): SmartSuggestion | null {
  if (!previousActivity) return null;

  return {
    activity: previousActivity,
    categoryId: null,
    confidence: 70,
    reason: "Resuming previous task",
    source: "history",
  };
}

/**
 * Deduplicate suggestions by activity name
 * Keep the highest confidence version
 */
function deduplicateSuggestions(
  suggestions: SmartSuggestion[]
): SmartSuggestion[] {
  const seen = new Map<string, SmartSuggestion>();

  suggestions.forEach((suggestion) => {
    const key = suggestion.activity.toLowerCase();
    const existing = seen.get(key);

    if (!existing || suggestion.confidence > existing.confidence) {
      seen.set(key, suggestion);
    }
  });

  return Array.from(seen.values());
}

/**
 * Get quick context suggestion (for immediate display)
 * Uses only current context, no history lookup
 */
export function getQuickContextSuggestion(
  activeTab: string,
  isIdle: boolean
): SmartSuggestion | null {
  const context = detectContext(activeTab, isIdle);

  if (!context.likelyTask || context.confidence < 60) {
    return null;
  }

  return {
    activity: context.likelyTask,
    categoryId: context.categoryId,
    confidence: context.confidence,
    reason: context.reason,
    source: "context",
  };
}

