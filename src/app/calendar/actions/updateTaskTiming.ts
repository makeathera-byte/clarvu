'use server';

import { createClient } from '@/lib/supabase/server';

export interface UpdateTaskTimingData {
    taskId: string;
    newStartTime: string;
    newEndTime: string;
}

export interface UpdateTaskTimingResult {
    success: boolean;
    task?: any;
    error?: string;
}

/**
 * Update task timing when dragged on calendar
 * Only allows updating completed tasks
 */
export async function updateTaskTiming(
    data: UpdateTaskTimingData
): Promise<UpdateTaskTimingResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // First, verify the task belongs to the user and is completed
        const { data: existingTask, error: fetchError } = await (supabase as any)
            .from('tasks')
            .select('id, status, user_id')
            .eq('id', data.taskId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingTask) {
            return { success: false, error: 'Task not found' };
        }

        // Only allow updating timing for completed tasks
        if (existingTask.status !== 'completed') {
            return { success: false, error: 'Can only drag completed tasks' };
        }

        // Calculate new duration based on time difference
        const startTime = new Date(data.newStartTime);
        const endTime = new Date(data.newEndTime);
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        // Update the task timing
        const { data: updatedTask, error: updateError } = await (supabase as any)
            .from('tasks')
            .update({
                start_time: data.newStartTime,
                end_time: data.newEndTime,
                duration_minutes: durationMinutes,
            })
            .eq('id', data.taskId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating task timing:', updateError);
            return { success: false, error: updateError.message };
        }

        return { success: true, task: updatedTask };
    } catch (error) {
        console.error('Unexpected error updating task timing:', error);
        return { success: false, error: 'Failed to update task timing' };
    }
}
