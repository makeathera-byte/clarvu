'use server';

import { createClient } from '@/lib/supabase/server';

interface MonthlyFocus {
    year: number;
    month: number;
    focus: string;
}

/**
 * Get monthly focus for a specific month
 */
export async function getMonthlyFocus(year: number, month: number): Promise<{ focus: string | null; error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { focus: null, error: 'Not authenticated' };
    }

    try {
        // Get user preferences
        const { data, error } = await (supabase as any)
            .from('user_preferences')
            .select('monthly_focus')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching monthly focus:', error);
            return { focus: null, error: error.message };
        }

        const monthlyFocusData = data?.monthly_focus || {};
        const key = `${year}-${String(month).padStart(2, '0')}`;
        const focus = monthlyFocusData[key] || null;

        return { focus, error: null };
    } catch (error: any) {
        console.error('Error in getMonthlyFocus:', error);
        return { focus: null, error: error.message };
    }
}

/**
 * Update monthly focus for a specific month
 */
export async function updateMonthlyFocus(year: number, month: number, focusText: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const key = `${year}-${String(month).padStart(2, '0')}`;

        // First, try to get existing preferences
        const { data: existingData } = await (supabase as any)
            .from('user_preferences')
            .select('monthly_focus')
            .eq('user_id', user.id)
            .single();

        const monthlyFocusData = existingData?.monthly_focus || {};
        monthlyFocusData[key] = focusText;

        // Upsert the preferences
        const { error } = await (supabase as any)
            .from('user_preferences')
            .upsert({
                user_id: user.id,
                monthly_focus: monthlyFocusData,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('Error updating monthly focus:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('Error in updateMonthlyFocus:', error);
        return { success: false, error: error.message };
    }
}
