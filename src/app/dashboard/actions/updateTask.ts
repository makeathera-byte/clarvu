'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface UpdateTaskData {
    taskId: string;
    priority?: 'low' | 'medium' | 'high';
    isScheduled?: boolean;
    startTime?: string | null;
}

export interface UpdateTaskResult {
    success?: boolean;
    error?: string;
    task?: any;
}

export async function updateTaskAction(data: UpdateTaskData): Promise<UpdateTaskResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Build update object
    const updates: any = {};

    if (data.priority !== undefined) {
        updates.priority = data.priority;
    }

    if (data.isScheduled !== undefined) {
        updates.is_scheduled = data.isScheduled;
        
        // If unscheduling, set status to unscheduled and clear start_time
        if (!data.isScheduled) {
            updates.status = 'unscheduled';
            updates.start_time = null;
        } else if (data.startTime) {
            // If scheduling, set start_time and update status
            updates.start_time = data.startTime;
            const start = new Date(data.startTime);
            const now = new Date();
            updates.status = start > now ? 'scheduled' : 'in_progress';
        } else {
            // If scheduling but no time provided, set to scheduled with current time
            const now = new Date();
            updates.start_time = now.toISOString();
            updates.status = 'scheduled';
        }
    } else if (data.startTime !== undefined) {
        // Just updating start time
        updates.start_time = data.startTime;
        if (data.startTime) {
            const start = new Date(data.startTime);
            const now = new Date();
            updates.status = start > now ? 'scheduled' : 'in_progress';
        }
    }

    // Update the task
    const { data: updatedTask, error } = await (supabase as any)
        .from('tasks')
        .update(updates)
        .eq('id', data.taskId)
        .eq('user_id', user.id) // Ensure user owns the task
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // Revalidate dashboard to show updated task
    revalidatePath('/dashboard');

    return {
        success: true,
        task: updatedTask,
    };
}

