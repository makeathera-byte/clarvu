'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Fetch agenda blocks for the Intent Calendar
 * Optionally filter by date range
 */
export async function fetchAgendaBlocks(startDate?: string, endDate?: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { blocks: [], error: 'Not authenticated' };
    }

    let query = supabase
        .from('agenda_blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

    // Optional date range filtering
    if (startDate && endDate) {
        query = query
            .gte('end_date', startDate) // Block ends on or after range start
            .lte('start_date', endDate); // Block starts on or before range end
    }

    const { data: blocks, error } = await query;

    if (error) {
        console.error('Error fetching agenda blocks:', error);
        return { blocks: [], error: error.message };
    }

    return { blocks: blocks || [], error: null };
}
