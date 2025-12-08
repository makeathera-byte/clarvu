'use server';

import { createClient } from '@/lib/supabase/server';

type DateRange = 'today' | '7d' | '30d' | 'all';

function getDateRangeStart(range: DateRange): Date | null {
    const now = new Date();
    switch (range) {
        case 'today':
            now.setHours(0, 0, 0, 0);
            return now;
        case '7d':
            now.setDate(now.getDate() - 7);
            return now;
        case '30d':
            now.setDate(now.getDate() - 30);
            return now;
        case 'all':
            return null;
    }
}

export async function exportTasksCSV(range: DateRange = 'all') {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    let query = supabase
        .from('tasks')
        .select('id, title, description, category, status, estimated_minutes, actual_minutes, scheduled_for, completed_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const startDate = getDateRangeStart(range);
    if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) return { error: error.message };

    // Build CSV
    if (!data || data.length === 0) {
        return { csv: 'No tasks found', filename: `dayflow_tasks_${range}.csv` };
    }

    const headers = Object.keys(data[0]);
    const rows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(h => {
                const val = String(row[h as keyof typeof row] ?? '').replace(/"/g, '""');
                return val.includes(',') ? `"${val}"` : val;
            }).join(',')
        )
    ];

    return { csv: rows.join('\n'), filename: `dayflow_tasks_${range}.csv` };
}

export async function exportTasksJSON() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };

    return { json: JSON.stringify(data, null, 2), filename: 'dayflow_tasks_all.json' };
}

export async function exportCalendarCSV() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, description, start_time, end_time, all_day, source, created_at')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

    if (error) return { error: error.message };

    if (!data || data.length === 0) {
        return { csv: 'No calendar events found', filename: 'dayflow_calendar.csv' };
    }

    const headers = Object.keys(data[0]);
    const rows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(h => {
                const val = String(row[h as keyof typeof row] ?? '').replace(/"/g, '""');
                return val.includes(',') ? `"${val}"` : val;
            }).join(',')
        )
    ];

    return { csv: rows.join('\n'), filename: 'dayflow_calendar.csv' };
}

export async function exportAnalyticsJSON() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5000);

    if (error) return { error: error.message };

    return { json: JSON.stringify(data, null, 2), filename: 'dayflow_analytics.json' };
}

export async function getProductivitySummary() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get tasks from last 7 days
    const { data: tasks } = await (supabase as any)
        .from('tasks')
        .select('category, actual_minutes, status')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

    // Get analytics events
    const { data: analytics } = await (supabase as any)
        .from('analytics_events')
        .select('event_type, duration_minutes')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

    // Calculate stats
    const taskList = tasks as Array<{ category?: string; status?: string; actual_minutes?: number }> || [];
    const analyticsList = analytics as Array<{ event_type?: string; duration_minutes?: number }> || [];

    const tasksCount = taskList.length;
    const completedCount = taskList.filter(t => t.status === 'completed').length;

    // Deep work vs distraction (from analytics)
    let deepWorkMinutes = 0;
    let distractionMinutes = 0;

    analyticsList.forEach(e => {
        if (e.event_type === 'focus_session' || e.event_type === 'deep_work') {
            deepWorkMinutes += e.duration_minutes || 0;
        } else if (e.event_type === 'distraction' || e.event_type === 'break') {
            distractionMinutes += e.duration_minutes || 0;
        }
    });

    // Top category
    const categoryCount: Record<string, number> = {};
    taskList.forEach(t => {
        if (t.category) {
            categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
        }
    });
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Top activity type
    const activityCount: Record<string, number> = {};
    analyticsList.forEach(e => {
        if (e.event_type) {
            activityCount[e.event_type] = (activityCount[e.event_type] || 0) + 1;
        }
    });
    const topActivity = Object.entries(activityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return {
        summary: {
            period: 'Last 7 Days',
            tasksCount,
            completedCount,
            completionRate: tasksCount > 0 ? Math.round((completedCount / tasksCount) * 100) : 0,
            deepWorkMinutes,
            distractionMinutes,
            topCategory,
            topActivity,
            generatedAt: new Date().toISOString(),
        }
    };
}
