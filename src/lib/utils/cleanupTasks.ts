import { supabaseClient } from '@/lib/supabase/client';

/**
 * Deletes completed tasks that ended before the specified date
 */
export async function deleteCompletedTasksBeforeDate(beforeDate: Date): Promise<{ success: boolean; count?: number }> {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        return { success: false };
    }

    const { data, error } = await supabaseClient
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .lt('end_time', beforeDate.toISOString())
        .select();

    if (error) {
        console.error('[Cleanup] Error deleting old completed tasks:', error);
        return { success: false };
    }

    return { success: true, count: data?.length || 0 };
}

/**
 * Automatically cleanup old completed tasks
 * Runs once per day based on localStorage timestamp
 */
export async function autoCleanupCompletedTasks(): Promise<void> {
    // Check if cleanup already ran today
    const lastCleanup = localStorage.getItem('clarvu_last_cleanup');
    const today = new Date().toDateString();

    if (lastCleanup === today) {
        console.log('[Cleanup] Already ran today, skipping');
        return;
    }

    // Delete completed tasks older than 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    console.log('[Cleanup] Running cleanup for tasks completed before:', yesterday.toISOString());
    const result = await deleteCompletedTasksBeforeDate(yesterday);

    if (result.success) {
        console.log(`[Cleanup] Successfully removed ${result.count || 0} old completed tasks`);
        localStorage.setItem('clarvu_last_cleanup', today);
    } else {
        console.error('[Cleanup] Failed to cleanup tasks');
    }
}
