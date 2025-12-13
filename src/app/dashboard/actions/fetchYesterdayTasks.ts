'use server';

import { createClient } from '@/lib/supabase/server';

interface TaskFromDB {
    id: string;
    title: string;
    status: string;
    start_time: string | null;
    category_id: string | null;
    priority: string;
}

/**
 * Fetch yesterday's incomplete tasks (scheduled but not completed)
 */
export async function fetchYesterdayIncompleteTasks(): Promise<TaskFromDB[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get yesterday's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
        // Fetch tasks from yesterday that are not completed
        const { data, error } = await (supabase as any)
            .from('tasks')
            .select('id, title, status, start_time, category_id, priority')
            .eq('user_id', user.id)
            .gte('start_time', yesterday.toISOString())
            .lt('start_time', today.toISOString())
            .neq('status', 'completed');

        if (error) {
            console.error('Error fetching yesterday tasks:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Unexpected error fetching yesterday tasks:', err);
        return [];
    }
}
