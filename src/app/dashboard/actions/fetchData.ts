'use server';

import { createClient } from '@/lib/supabase/server';
import { getTodayRange } from '@/lib/utils/date';

interface TaskFromDB {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'unscheduled';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    priority: 'low' | 'medium' | 'high';
    is_scheduled: boolean;
}

interface CategoryFromDB {
    id: string;
    name: string;
    color: string;
    type: string;
}

interface UserProfile {
    full_name: string | null;
    timezone: string | null;
    country: string | null;
    theme_name: string | null;
    onboarding_complete: boolean | null;
}

interface CalendarEventFromDB {
    id: string;
    external_id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
}

export async function fetchTodayTasks(): Promise<TaskFromDB[]> {
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

    // Get today's date range in user's timezone
    const { start, end } = getTodayRange(userTimezone);

    try {
        // Fetch all user's tasks (we'll filter in memory for better control)
        const query = (supabase as any)
            .from('tasks')
            .select('id, title, status, start_time, end_time, duration_minutes, category_id, priority, is_scheduled')
            .eq('user_id', user.id);

        // Order by start_time, with nulls last
        const { data, error } = await query.order('start_time', { ascending: true });

        if (error) {
            // Better error logging
            const errorInfo = {
                message: error.message || 'Unknown error',
                details: error.details || null,
                hint: error.hint || null,
                code: error.code || null,
            };

            // Try to stringify, but handle circular references
            let errorString = 'Unknown error';
            try {
                errorString = JSON.stringify(errorInfo, null, 2);
            } catch (e) {
                errorString = String(error);
            }

            console.error('Error fetching tasks:', errorString);
            console.error('Raw error object:', error);
            return [];
        }

        // Ensure all tasks have priority and is_scheduled (safety check)
        const tasksWithDefaults = (data || []).map((task: any) => ({
            ...task,
            priority: task.priority || 'medium',
            is_scheduled: task.is_scheduled !== undefined ? task.is_scheduled : true,
        }));

        // Filter to only include tasks that are either:
        // - Scheduled for today (start_time within today's range)
        // - Unscheduled backlog tasks (status='unscheduled' OR is_scheduled=false with no future start_time)
        const filteredData = tasksWithDefaults.filter((task: TaskFromDB) => {
            // Include truly unscheduled tasks (backlog with no date)
            if (task.status === 'unscheduled' && !task.start_time) {
                return true;
            }

            // Include tasks explicitly marked as unscheduled with no scheduled time
            if (!task.is_scheduled && !task.start_time) {
                return true;
            }

            // If task has a start_time, check if it's for today
            if (task.start_time) {
                const taskStart = new Date(task.start_time);
                return taskStart >= start && taskStart < end;
            }

            // Exclude everything else (tasks without start_time that aren't explicitly unscheduled)
            return false;
        });

        return filteredData;
    } catch (err) {
        console.error('Unexpected error fetching tasks:', err);
        return [];
    }
}

export async function fetchCategories(): Promise<CategoryFromDB[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
        .from('categories')
        .select('id, name, color, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    console.log('[fetchCategories] Fetched categories:', data?.map((c: any) => c.name));

    // Deduplicate categories by name (keep first occurrence)
    const seen = new Set<string>();
    const uniqueCategories = (data || []).filter((cat: CategoryFromDB) => {
        const normalizedName = cat.name.toLowerCase().trim();
        if (seen.has(normalizedName)) {
            return false;
        }
        seen.add(normalizedName);
        return true;
    });

    return uniqueCategories;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await (supabase as any)
        .from('profiles')
        .select('full_name, timezone, country, theme_name, onboarding_complete')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}

export async function fetchTodayCalendarEvents(): Promise<CalendarEventFromDB[]> {
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

    // Get today's date range in user's timezone
    const { start, end } = getTodayRange(userTimezone);

    const { data, error } = await (supabase as any)
        .from('calendar_events')
        .select('id, external_id, title, description, start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', start.toISOString())
        .lt('start_time', end.toISOString())
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }

    return data || [];
}
