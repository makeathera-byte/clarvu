'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface StartTaskResult {
    success?: boolean;
    error?: string;
}

export async function startTaskAction(taskId: string): Promise<StartTaskResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + 30 * 60000); // 30 minutes later

    // SINGLE ACTIVE TASK RULE: End any existing in_progress tasks
    await (supabase as any)
        .from('tasks')
        .update({
            status: 'completed',
            end_time: now.toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .neq('id', taskId); // Don't update the task we're about to start

    // Update task to in_progress
    const { error: taskError } = await (supabase as any)
        .from('tasks')
        .update({
            status: 'in_progress',
            start_time: now.toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

    if (taskError) {
        return { error: taskError.message };
    }

    // Delete any existing active timer for this user (one timer per user)
    await (supabase as any)
        .from('active_timers')
        .delete()
        .eq('user_id', user.id);

    // Create new active timer entry
    const { error: timerError } = await (supabase as any)
        .from('active_timers')
        .insert({
            task_id: taskId,
            user_id: user.id,
            started_at: now.toISOString(),
            ends_at: endsAt.toISOString(),
            remaining_seconds: 30 * 60, // 1800 seconds
            is_running: true,
        });

    if (timerError) {
        return { error: timerError.message };
    }

    // Revalidate dashboard
    revalidatePath('/dashboard');

    return { success: true };
}
