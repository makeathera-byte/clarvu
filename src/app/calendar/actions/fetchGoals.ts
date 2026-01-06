'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Fetch goals for the Intent Calendar
 * Returns active goals for the authenticated user
 */
export async function fetchGoals() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { goals: [], error: 'Not authenticated' };
    }

    const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching goals:', error);
        return { goals: [], error: error.message };
    }

    return { goals: goals || [], error: null };
}
