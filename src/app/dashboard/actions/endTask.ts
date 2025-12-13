'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface EndTaskResult {
    success?: boolean;
    error?: string;
}

/**
 * End a task and mark it as completed
 * @param taskId - The task ID to end
 * @param actualFocusMinutes - The actual focused time in minutes (from timer)
 * @param endedAt - Optional end time override
 */
export async function endTaskAction(
    taskId: string,
    actualFocusMinutes?: number,
    endedAt?: string
): Promise<EndTaskResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const end = endedAt ? new Date(endedAt) : new Date();

    // Use actual focus time from timer if provided, otherwise calculate from timestamps
    let durationMinutes = actualFocusMinutes;

    if (durationMinutes === undefined) {
        // Fallback: calculate from start_time to end_time
        const { data: task } = await (supabase as any)
            .from('tasks')
            .select('start_time')
            .eq('id', taskId)
            .eq('user_id', user.id)
            .single();

        if (task?.start_time) {
            const startTime = new Date(task.start_time);
            durationMinutes = Math.round((end.getTime() - startTime.getTime()) / 60000);
        } else {
            durationMinutes = 0;
        }
    }

    // Update task to completed with actual focus time
    const { error: taskError } = await (supabase as any)
        .from('tasks')
        .update({
            status: 'completed',
            end_time: end.toISOString(),
            duration_minutes: durationMinutes,
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

    if (taskError) {
        return { error: taskError.message };
    }

    // Remove from active timers
    await (supabase as any)
        .from('active_timers')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', user.id);

    // Revalidate dashboard
    revalidatePath('/dashboard');

    return { success: true };
}

