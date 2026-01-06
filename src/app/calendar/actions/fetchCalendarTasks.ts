'use server';

import { createClient } from '@/lib/supabase/server';

export interface CalendarTask {
    id: string;
    user_id: string;
    title: string;
    category_id: string | null;
    category_color?: string;
    category_name?: string;
    priority: 'low' | 'medium' | 'high';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'unscheduled';
    created_at: string;
}

export interface FetchCalendarTasksResult {
    success: boolean;
    tasks?: CalendarTask[];
    error?: string;
}

/**
 * Fetch tasks for calendar views by date range
 * @param startDate ISO string for range start
 * @param endDate ISO string for range end
 */
export async function fetchCalendarTasks(
    startDate: string,
    endDate: string
): Promise<FetchCalendarTasksResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Fetch tasks within the date range
        // Include tasks that start, end, or span the date range
        const { data: tasks, error } = await (supabase as any)
            .from('tasks')
            .select(`
                id,
                user_id,
                title,
                category_id,
                priority,
                start_time,
                end_time,
                duration_minutes,
                status,
                created_at,
                categories (
                    id,
                    name,
                    color
                )
            `)
            .eq('user_id', user.id)
            .or(`start_time.gte.${startDate},end_time.gte.${startDate}`)
            .or(`start_time.lte.${endDate},end_time.lte.${endDate}`)
            .order('start_time', { ascending: true, nullsFirst: false });

        if (error) {
            console.error('Error fetching calendar tasks:', error);
            return { success: false, error: error.message };
        }

        // Transform data to include category color and name
        const calendarTasks: CalendarTask[] = (tasks || []).map((task: any) => ({
            id: task.id,
            user_id: task.user_id,
            title: task.title,
            category_id: task.category_id,
            category_color: task.categories?.color || '#6b7280',
            category_name: task.categories?.name || 'Uncategorized',
            priority: task.priority || 'medium',
            start_time: task.start_time,
            end_time: task.end_time,
            duration_minutes: task.duration_minutes,
            status: task.status,
            created_at: task.created_at,
        }));

        return { success: true, tasks: calendarTasks };
    } catch (error) {
        console.error('Unexpected error fetching calendar tasks:', error);
        return { success: false, error: 'Failed to fetch tasks' };
    }
}
