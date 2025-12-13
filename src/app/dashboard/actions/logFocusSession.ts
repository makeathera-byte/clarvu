'use server';

import { createClient } from '@/lib/supabase/server';

export interface LogFocusSessionResult {
    success: boolean;
    error?: string;
}

/**
 * Log a standalone focus session to analytics_events for deep work tracking
 * This is called when the standalone timer (without a task) completes
 */
export async function logFocusSessionAction(
    durationMinutes: number,
    sessionType: 'focus' | 'pomodoro' = 'focus'
): Promise<LogFocusSessionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    if (durationMinutes <= 0) {
        return { success: false, error: 'Invalid duration' };
    }

    // Insert focus session event into analytics_events
    const { error: insertError } = await supabase
        .from('analytics_events')
        .insert({
            user_id: user.id,
            event_type: 'focus_session',
            details: {
                duration_minutes: durationMinutes,
                session_type: sessionType,
                source: 'standalone_timer',
            },
        } as any);

    if (insertError) {
        console.error('Failed to log focus session:', insertError);
        return { success: false, error: insertError.message };
    }

    return { success: true };
}

