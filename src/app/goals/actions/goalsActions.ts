'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type GoalPeriod = '7d' | '30d' | '365d';
export type GoalStatus = 'active' | 'completed' | 'failed';

export interface Goal {
    id: string;
    user_id: string;
    period: GoalPeriod;
    goal_text: string;
    start_date: string;
    end_date: string;
    status: GoalStatus;
    reflection: string | null;
    last_checked_at: string | null;
    created_at: string;
}

export interface CreateGoalResult {
    success?: boolean;
    error?: string;
    goal?: Goal;
}

export async function createGoal(period: GoalPeriod, goalText: string): Promise<CreateGoalResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (period === '7d') endDate.setDate(endDate.getDate() + 7);
    else if (period === '30d') endDate.setDate(endDate.getDate() + 30);
    else if (period === '365d') endDate.setDate(endDate.getDate() + 365);

    try {
        const { data, error } = await (supabase as any)
            .from('goals')
            .insert({
                user_id: user.id,
                period,
                goal_text: goalText,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            // Check for unique constraint violation (one active goal per period)
            if (error.code === '23505') {
                return { error: 'You already have an active goal for this period.' };
            }
            return { error: error.message };
        }

        revalidatePath('/goals');
        return { success: true, goal: data };
    } catch (e: any) {
        return { error: e.message || 'Failed to create goal' };
    }
}

export async function getActiveGoals(): Promise<Goal[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

    if (error) return [];
    return data || [];
}

export async function getGoalHistory(period?: GoalPeriod): Promise<Goal[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = (supabase as any)
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'active')
        .order('created_at', { ascending: false });

    if (period) {
        query = query.eq('period', period);
    }

    const { data, error } = await query;

    if (error) return [];
    return data || [];
}

export async function updateGoal(id: string, goalText: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('goals')
        .update({ goal_text: goalText })
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('status', 'active'); // Can only edit active goals

    if (error) return { success: false, error: error.message };

    revalidatePath('/goals');
    return { success: true };
}

export async function completeGoal(id: string, accomplished: boolean, reflection?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const status = accomplished ? 'completed' : 'failed';
    const now = new Date().toISOString();

    const { error } = await (supabase as any)
        .from('goals')
        .update({
            status,
            reflection,
            last_checked_at: now
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('status', 'active');

    if (error) return { success: false, error: error.message };

    revalidatePath('/goals');
    return { success: true };
}

export async function deleteGoal(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/goals');
    return { success: true };
}
