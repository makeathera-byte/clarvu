'use server';

import { createClient } from '@/lib/supabase/server';
import { runRoutineAI } from '@/lib/ai/routineGenerator';

interface RoutineItem {
    time: string;
    activity: string;
    duration: string;
    category?: string;
}

interface RoutineResult {
    morning: RoutineItem[];
    afternoon: RoutineItem[];
    evening: RoutineItem[];
    notes: string;
}

export async function generateRoutineAction(): Promise<{ routine?: RoutineResult; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    try {
        // Fetch last 14 days of tasks
        const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);

        const { data: tasks } = await (supabase as any)
            .from('tasks')
            .select('id, title, start_time, end_time, status, category_id')
            .eq('user_id', user.id)
            .gte('start_time', fourteenDaysAgo.toISOString())
            .order('start_time', { ascending: true });

        // Fetch categories
        const { data: categories } = await (supabase as any)
            .from('categories')
            .select('id, name, color, type')
            .eq('user_id', user.id);

        // Fetch today's Google events
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const tomorrow = new Date(todayStart.getTime() + 86400000);

        const { data: events } = await (supabase as any)
            .from('calendar_events')
            .select('title, start_time, end_time')
            .eq('user_id', user.id)
            .gte('start_time', todayStart.toISOString())
            .lt('start_time', tomorrow.toISOString())
            .order('start_time', { ascending: true });

        // Generate routine using AI
        const routine = await runRoutineAI(tasks, categories, events);

        return { routine };
    } catch (error) {
        console.error('Error generating routine:', error);
        return { error: 'Failed to generate routine' };
    }
}
