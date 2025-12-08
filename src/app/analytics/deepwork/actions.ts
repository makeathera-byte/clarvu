'use server';

import { createClient } from '@/lib/supabase/server';

type DateRange = '7d' | '30d';

function getDateRangeStart(range: DateRange): Date {
    const now = new Date();
    switch (range) {
        case '7d':
            now.setDate(now.getDate() - 7);
            return now;
        case '30d':
            now.setDate(now.getDate() - 30);
            return now;
    }
}

export async function getDeepWorkSessions(range: DateRange = '7d') {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const startDate = getDateRangeStart(range);

    // Get completed tasks with actual_minutes
    const { data: tasks } = await (supabase as any)
        .from('tasks')
        .select('id, title, category, actual_minutes, completed_at, created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false });

    const taskList = (tasks || []) as Array<{
        id: string;
        title: string;
        category?: string;
        actual_minutes?: number;
        completed_at: string;
        created_at: string;
    }>;

    // Calculate total deep work minutes per day
    const dailyMinutes: Record<string, number> = {};
    let totalMinutes = 0;

    taskList.forEach(task => {
        const date = new Date(task.completed_at).toISOString().split('T')[0];
        const minutes = task.actual_minutes || 0;
        dailyMinutes[date] = (dailyMinutes[date] || 0) + minutes;
        totalMinutes += minutes;
    });

    const days = Object.keys(dailyMinutes).sort();
    const avgMinutesPerDay = days.length > 0 ? Math.round(totalMinutes / days.length) : 0;

    return {
        sessions: taskList,
        dailyMinutes,
        totalMinutes,
        avgMinutesPerDay,
        daysWithWork: days.length,
        totalDays: range === '7d' ? 7 : 30,
    };
}

export async function getSessionQuality() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get completed tasks
    const { data: tasks } = await (supabase as any)
        .from('tasks')
        .select('actual_minutes, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', sevenDaysAgo.toISOString());

    const taskList = (tasks || []) as Array<{ actual_minutes?: number; completed_at: string }>;

    // Calculate quality metrics
    let totalMinutes = 0;
    let longestSession = 0;
    const sessionLengths: number[] = [];

    taskList.forEach(task => {
        const minutes = task.actual_minutes || 0;
        totalMinutes += minutes;
        if (minutes > longestSession) longestSession = minutes;
        sessionLengths.push(minutes);
    });

    // Quality formula: higher is better
    // Base on total minutes, longest streak, and session count
    const sessionCount = taskList.length;
    const avgSessionLength = sessionCount > 0 ? totalMinutes / sessionCount : 0;

    // Score: 0-100
    // 240 min deep work = 100 points, 60 avg session = +20, 60 min longest = +20
    const baseScore = Math.min(totalMinutes / 2.4, 100) * 0.6;
    const avgBonus = Math.min(avgSessionLength, 60) * 0.33;
    const longestBonus = Math.min(longestSession, 60) * 0.33;

    const qualityScore = Math.round(Math.min(baseScore + avgBonus + longestBonus, 100));

    // Trend: last 7 days quality per day
    const dailyScores: Record<string, number> = {};
    taskList.forEach(task => {
        const date = new Date(task.completed_at).toISOString().split('T')[0];
        dailyScores[date] = (dailyScores[date] || 0) + (task.actual_minutes || 0);
    });

    const trend = Object.entries(dailyScores)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, mins]) => ({ date, score: Math.min(Math.round(mins / 2.4), 100) }));

    return {
        qualityScore,
        totalMinutes,
        longestSession,
        avgSessionLength: Math.round(avgSessionLength),
        sessionCount,
        trend,
    };
}

export async function getConsistencyIndex() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: tasks } = await (supabase as any)
        .from('tasks')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', thirtyDaysAgo.toISOString());

    const taskList = (tasks || []) as Array<{ completed_at: string }>;

    // Get unique work days
    const workDays = new Set<string>();
    taskList.forEach(task => {
        const date = new Date(task.completed_at).toISOString().split('T')[0];
        workDays.add(date);
    });

    // Calculate current streak
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (workDays.has(dateStr)) {
            if (i === 0 || currentStreak > 0) currentStreak++;
            tempStreak++;
            if (tempStreak > bestStreak) bestStreak = tempStreak;
        } else {
            if (currentStreak > 0 && i > 0) {
                // Break in current streak
            }
            tempStreak = 0;
        }
    }

    const consistencyPercent = Math.round((workDays.size / 30) * 100);

    // Find last non-working day
    let lastOffDay: string | null = null;
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (!workDays.has(dateStr)) {
            lastOffDay = dateStr;
            break;
        }
    }

    return {
        consistencyPercent,
        currentStreak,
        bestStreak,
        daysWorked: workDays.size,
        totalDays: 30,
        lastOffDay,
        workDays: Array.from(workDays).sort(),
    };
}

export async function getCategoryEffectiveness() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: tasks } = await (supabase as any)
        .from('tasks')
        .select('category, actual_minutes, status')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

    const taskList = (tasks || []) as Array<{ category?: string; actual_minutes?: number; status: string }>;

    // Calculate effectiveness per category
    const categoryStats: Record<string, { completed: number; total: number; minutes: number }> = {};

    taskList.forEach(task => {
        const cat = task.category || 'Uncategorized';
        if (!categoryStats[cat]) {
            categoryStats[cat] = { completed: 0, total: 0, minutes: 0 };
        }
        categoryStats[cat].total++;
        if (task.status === 'completed') {
            categoryStats[cat].completed++;
            categoryStats[cat].minutes += task.actual_minutes || 0;
        }
    });

    // Calculate effectiveness score
    const categories = Object.entries(categoryStats).map(([name, stats]) => {
        const completionRate = stats.total > 0 ? stats.completed / stats.total : 0;
        const avgMinutes = stats.completed > 0 ? stats.minutes / stats.completed : 0;
        // Effectiveness: completion rate * avg session length normalized
        const effectiveness = Math.round(completionRate * 100 * (1 + Math.min(avgMinutes, 60) / 120));

        return {
            name,
            effectiveness: Math.min(effectiveness, 100),
            completedTasks: stats.completed,
            totalTasks: stats.total,
            totalMinutes: stats.minutes,
        };
    });

    // Sort by effectiveness
    categories.sort((a, b) => b.effectiveness - a.effectiveness);

    return {
        categories,
        bestCategory: categories[0]?.name || null,
        worstCategory: categories[categories.length - 1]?.name || null,
    };
}

export async function getWeeklyTrend() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: tasks } = await (supabase as any)
        .from('tasks')
        .select('actual_minutes, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', thirtyDaysAgo.toISOString());

    const taskList = (tasks || []) as Array<{ actual_minutes?: number; completed_at: string }>;

    // Group by day
    const dailyMinutes: Record<string, number> = {};

    // Initialize all 30 days with 0
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyMinutes[d.toISOString().split('T')[0]] = 0;
    }

    taskList.forEach(task => {
        const date = new Date(task.completed_at).toISOString().split('T')[0];
        dailyMinutes[date] = (dailyMinutes[date] || 0) + (task.actual_minutes || 0);
    });

    const trend = Object.entries(dailyMinutes)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, minutes]) => ({
            date,
            minutes,
            displayDate: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        }));

    const weeklyAvg = trend.slice(-7).reduce((sum, d) => sum + d.minutes, 0) / 7;
    const monthlyAvg = trend.reduce((sum, d) => sum + d.minutes, 0) / 30;

    return {
        trend,
        weeklyAvg: Math.round(weeklyAvg),
        monthlyAvg: Math.round(monthlyAvg),
        totalMinutes: trend.reduce((sum, d) => sum + d.minutes, 0),
    };
}

export async function getDeepWorkInsights() {
    // Get all metrics
    const [quality, consistency, categories, weekly] = await Promise.all([
        getSessionQuality(),
        getConsistencyIndex(),
        getCategoryEffectiveness(),
        getWeeklyTrend(),
    ]);

    const insights: string[] = [];

    // Generate insights based on data
    if ('qualityScore' in quality && quality.qualityScore !== undefined) {
        const score = quality.qualityScore;
        if (score >= 80) {
            insights.push('Your focus quality is excellent! Keep maintaining your current routine.');
        } else if (score >= 50) {
            insights.push('Your session quality is good. Try longer uninterrupted sessions for better results.');
        } else {
            insights.push('Consider scheduling dedicated 45-60 minute focus blocks to improve quality.');
        }
    }

    if ('consistencyPercent' in consistency && consistency.consistencyPercent !== undefined) {
        const percent = consistency.consistencyPercent;
        const worked = consistency.daysWorked ?? 0;
        const streak = consistency.currentStreak ?? 0;

        if (percent >= 80) {
            insights.push(`Great consistency! You've worked ${worked} of the last 30 days.`);
        } else if (percent >= 50) {
            insights.push('Try to maintain a daily habit - even 25 minutes counts as a deep work day.');
        } else {
            insights.push('Focus on showing up every day, even briefly, to build momentum.');
        }

        if (streak >= 7) {
            insights.push(`🔥 ${streak}-day streak! Keep the momentum going.`);
        }
    }

    if ('categories' in categories && categories.categories && categories.categories.length > 0) {
        const best = categories.categories[0];
        insights.push(`Your most effective category is "${best.name}" with ${best.totalMinutes} minutes logged.`);
    }

    if ('weeklyAvg' in weekly && weekly.weeklyAvg !== undefined) {
        const avg = weekly.weeklyAvg;
        if (avg >= 120) {
            insights.push('You average 2+ hours of deep work daily - excellent productivity.');
        } else if (avg >= 60) {
            insights.push('Solid 1-hour daily average. Adding 30 more minutes could boost output significantly.');
        }
    }

    return { insights };
}

