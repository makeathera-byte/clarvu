'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface CancelTaskResult {
    success?: boolean;
    error?: string;
    task?: any;
}

/**
 * Cancel a running task - resets status to scheduled without recording time
 * Used when user resets/cancels the timer while a task is running
 */
export async function cancelTaskAction(taskId: string): Promise<CancelTaskResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Reset task to scheduled status, clear start_time (task was cancelled, not completed)
    const { data: task, error: taskError } = await (supabase as any)
        .from('tasks')
        .update({
            status: 'scheduled',
            start_time: null,
            end_time: null,
            duration_minutes: null,
        })
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

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

    return { success: true, task };
}
