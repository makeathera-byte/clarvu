'use server';

import { createClient } from '@/lib/supabase/server';

type Quarter = 1 | 2 | 3 | 4;

/**
 * Get quarter focus for a specific quarter
 */
export async function getQuarterFocus(year: number, quarter: Quarter): Promise<{ focus: string | null; error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { focus: null, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await (supabase as any)
            .from('user_preferences')
            .select('quarter_focus')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching quarter focus:', error);
            return { focus: null, error: error.message };
        }

        const quarterFocusData = data?.quarter_focus || {};
        const key = `${year}-Q${quarter}`;
        const focus = quarterFocusData[key] || null;

        return { focus, error: null };
    } catch (error: any) {
        console.error('Error in getQuarterFocus:', error);
        return { focus: null, error: error.message };
    }
}

/**
 * Update quarter focus for a specific quarter
 */
export async function updateQuarterFocus(year: number, quarter: Quarter, focusText: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const key = `${year}-Q${quarter}`;

        // Get existing preferences
        const { data: existingData } = await (supabase as any)
            .from('user_preferences')
            .select('quarter_focus')
            .eq('user_id', user.id)
            .single();

        const quarterFocusData = existingData?.quarter_focus || {};
        quarterFocusData[key] = focusText;

        // Upsert
        const { error } = await (supabase as any)
            .from('user_preferences')
            .upsert({
                user_id: user.id,
                quarter_focus: quarterFocusData,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('Error updating quarter focus:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('Error in updateQuarterFocus:', error);
        return { success: false, error: error.message };
    }
}
