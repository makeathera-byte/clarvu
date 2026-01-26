'use server';

import { createClient } from '@/lib/supabase/server';
import { getTodayRange } from '@/lib/utils/date';

interface AnalyticsTask {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    created_at: string;
}

interface AnalyticsCategory {
    id: string;
    name: string;
    color: string;
    type: string;
}

export async function fetchAnalyticsTasks(days: number = 30): Promise<AnalyticsTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await (supabase as any)
        .from('tasks')
        .select('id, title, status, start_time, end_time, duration_minutes, category_id, created_at')
        .eq('user_id', user.id)
        .or(`start_time.gte.${startDate.toISOString()},and(start_time.is.null,created_at.gte.${startDate.toISOString()})`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching analytics tasks:', error);
        return [];
    }

    return data || [];
}

export async function fetchAllCategories(): Promise<AnalyticsCategory[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
        .from('categories')
        .select('id, name, color, type')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data || [];
}

export async function fetchTodayTasksForAnalytics(): Promise<AnalyticsTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get user's timezone from profile to match dashboard logic
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

    const userTimezone = profile?.timezone || 'UTC';

    // Use getTodayRange to match dashboard logic exactly
    const { start, end } = getTodayRange(userTimezone);

    // Match dashboard's fetchTodayTasks logic:
    // - Include tasks scheduled for today (start_time within today's range)
    // - Include unscheduled backlog tasks (is_scheduled = false AND no start_time)
    const { data, error } = await (supabase as any)
        .from('tasks')
        .select('id, title, status, start_time, end_time, duration_minutes, category_id, created_at')
        .eq('user_id', user.id)
        .or(`and(start_time.gte.${start.toISOString()},start_time.lt.${end.toISOString()}),and(start_time.is.null,is_scheduled.eq.false)`)
        .order('start_time', { ascending: true, nullsFirst: false });

    if (error) {
        console.error('Error fetching today tasks:', error);
        return [];
    }

    return data || [];
}

export async function fetchYesterdayTasks(): Promise<AnalyticsTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get user's timezone from profile
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

    const userTimezone = profile?.timezone || 'UTC';

    // Calculate yesterday's range in user's timezone
    const todayInTz = new Date();
    const yesterdayDate = new Date(todayInTz);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    // Get yesterday's midnight to today's midnight in user timezone
    const todayRange = getTodayRange(userTimezone);
    const yesterdayRange = getTodayRange(userTimezone);

    // Adjust to get yesterday by subtracting 24 hours from today's range
    const yesterdayStart = new Date(todayRange.start);
    yesterdayStart.setUTCHours(yesterdayStart.getUTCHours() - 24);
    const yesterdayEnd = todayRange.start; // Yesterday ends when today starts

    const { data, error } = await (supabase as any)
        .from('tasks')
        .select('id, title, status, start_time, end_time, duration_minutes, category_id, created_at')
        .eq('user_id', user.id)
        .gte('start_time', yesterdayStart.toISOString())
        .lt('start_time', yesterdayEnd.toISOString())
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching yesterday tasks:', error);
        return [];
    }

    return data || [];
}
