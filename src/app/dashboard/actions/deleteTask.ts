'use server';

import { createClient } from '@/lib/supabase/server';

export interface DeleteTaskResult {
    success?: boolean;
    error?: string;
}

export async function deleteTaskAction(taskId: string): Promise<DeleteTaskResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Delete the task
    const { error } = await (supabase as any)
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id); // Ensure user owns the task

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
