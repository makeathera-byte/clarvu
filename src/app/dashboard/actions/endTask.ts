'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface EndTaskResult {
    success?: boolean;
    error?: string;
}

export async function endTaskAction(taskId: string, endedAt?: string): Promise<EndTaskResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const end = endedAt ? new Date(endedAt) : new Date();

    // Get task to calculate duration
    const { data: task } = await (supabase as any)
        .from('tasks')
        .select('start_time')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single();

    let durationMinutes = 30;
    if (task?.start_time) {
        const startTime = new Date(task.start_time);
        durationMinutes = Math.round((end.getTime() - startTime.getTime()) / 60000);
    }

    // Update task to completed
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
