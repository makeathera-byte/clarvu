interface ActivityLog {
  activity: string;
  start_time: string;
  end_time: string | null;
  category?: string | null;
  categories?: { name: string } | null;
}

interface FocusMetrics {
  totalWorkTime: number; // minutes
  deepWorkTime: number; // minutes
  contextSwitches: number;
  longestWorkBlock: number; // minutes
  averageBlockDuration: number; // minutes
  breakFrequency: number; // breaks per hour
  idleGaps: number; // gaps > 30 min
}

/**
 * Calculate non-AI metrics from activity logs
 */
export function calculateFocusMetrics(logs: ActivityLog[]): FocusMetrics {
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

  // Sort logs by start time
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
    const end = log.end_time
      ? new Date(log.end_time).getTime()
      : Date.now();
    const duration = Math.floor((end - start) / (1000 * 60)); // minutes

    const categoryName = log.categories?.name || log.category || "";
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

      // Check for context switch
      if (i > 0) {
        const prevLog = sortedLogs[i - 1];
        const prevCategory = prevLog.categories?.name || prevLog.category || "";
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

      if (isBreak) {
        breaks++;
      }

      // Check for idle gap (> 30 minutes)
      if (i > 0 && duration > 30) {
        idleGaps++;
      }
    }

    // Check for gaps between logs
    if (i > 0) {
      const prevLog = sortedLogs[i - 1];
      const prevEnd = prevLog.end_time
        ? new Date(prevLog.end_time).getTime()
        : Date.now();
      const gap = Math.floor((start - prevEnd) / (1000 * 60)); // minutes
      if (gap > 30) {
        idleGaps++;
      }
    }
  }

  // Add final work block
  if (currentWorkBlock > 0) {
    workBlocks.push(currentWorkBlock);
  }

  // Calculate averages
  const averageBlockDuration =
    workBlocks.length > 0
      ? workBlocks.reduce((sum, block) => sum + block, 0) / workBlocks.length
      : 0;

  longestWorkBlock = workBlocks.length > 0 ? Math.max(...workBlocks) : 0;

  // Calculate break frequency (breaks per hour of work)
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

/**
 * Calculate focus score from metrics (0-100)
 * This is a deterministic calculation based on metrics
 */
export function calculateFocusScore(metrics: FocusMetrics): number {
  if (metrics.totalWorkTime === 0) {
    return 0;
  }

  let score = 50; // Base score

  // Deep work ratio (up to +20 points)
  const deepWorkRatio = metrics.deepWorkTime / metrics.totalWorkTime;
  score += deepWorkRatio * 20;

  // Long work blocks (up to +15 points)
  if (metrics.longestWorkBlock >= 120) {
    score += 15;
  } else if (metrics.longestWorkBlock >= 60) {
    score += 10;
  } else if (metrics.longestWorkBlock >= 30) {
    score += 5;
  }

  // Average block duration (up to +10 points)
  if (metrics.averageBlockDuration >= 60) {
    score += 10;
  } else if (metrics.averageBlockDuration >= 30) {
    score += 5;
  }

  // Penalize context switches (up to -20 points)
  if (metrics.contextSwitches > 10) {
    score -= 20;
  } else if (metrics.contextSwitches > 5) {
    score -= 10;
  } else if (metrics.contextSwitches > 2) {
    score -= 5;
  }

  // Penalize idle gaps (up to -15 points)
  score -= Math.min(metrics.idleGaps * 5, 15);

  // Break frequency bonus (up to +10 points for good spacing)
  if (metrics.breakFrequency >= 0.5 && metrics.breakFrequency <= 2) {
    score += 10;
  } else if (metrics.breakFrequency > 2) {
    score -= 5; // Too many breaks
  }

  // Clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

