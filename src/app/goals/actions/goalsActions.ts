'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type GoalPeriod = '7d' | '30d' | '365d';
export type GoalStatus = 'active' | 'completed' | 'failed';
export type GoalPriority = 'high' | 'medium' | 'low';

export interface SubGoal {
    id: string;
    text: string;
    completed: boolean;
}

export interface Goal {
    id: string;
    user_id: string;
    period: GoalPeriod;
    goal_text: string;
    start_date: string;
    end_date: string;
    status: GoalStatus;
    priority: GoalPriority;
    progress_percentage: number;
    notes: string | null;
    order_index: number;
    sub_goals: SubGoal[];
    reflection: string | null;
    last_checked_at: string | null;
    created_at: string;
}

export interface CreateGoalResult {
    success?: boolean;
    error?: string;
    goal?: Goal;
}

export async function createGoal(
    period: GoalPeriod,
    goalText: string,
    priority: GoalPriority = 'medium',
    notes?: string
): Promise<CreateGoalResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    // Check active goals count for this period
    const { data: existingGoals, error: countError } = await (supabase as any)
        .from('goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('period', period)
        .eq('status', 'active');

    if (countError) return { error: countError.message };

    if (existingGoals && existingGoals.length >= 10) {
        return { error: 'Maximum 10 active goals per category. Complete or delete existing goals first.' };
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (period === '7d') endDate.setDate(endDate.getDate() + 7);
    else if (period === '30d') endDate.setDate(endDate.getDate() + 30);
    else if (period === '365d') endDate.setDate(endDate.getDate() + 365);

    // Get next order_index
    const nextOrderIndex = existingGoals ? existingGoals.length : 0;

    try {
        const { data, error } = await (supabase as any)
            .from('goals')
            .insert({
                user_id: user.id,
                period,
                goal_text: goalText,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                status: 'active',
                priority,
                progress_percentage: 0,
                notes: notes || null,
                order_index: nextOrderIndex,
                sub_goals: []
            })
            .select()
            .single();

        if (error) {
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
        .eq('status', 'active')
        .order('order_index', { ascending: true });

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

// New actions for enhanced features

export async function updateGoalProgress(id: string, percentage: number): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    if (percentage < 0 || percentage > 100) {
        return { success: false, error: 'Progress must be between 0 and 100' };
    }

    const { error } = await (supabase as any)
        .from('goals')
        .update({ progress_percentage: percentage })
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('status', 'active');

    if (error) return { success: false, error: error.message };

    revalidatePath('/goals');
    return { success: true };
}

export async function updateGoalPriority(id: string, priority: GoalPriority): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('goals')
        .update({ priority })
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('status', 'active');

    if (error) return { success: false, error: error.message };

    revalidatePath('/goals');
    return { success: true };
}

export async function updateGoalNotes(id: string, notes: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('goals')
        .update({ notes })
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('status', 'active');

    if (error) return { success: false, error: error.message };

    revalidatePath('/goals');
    return { success: true };
}

export async function addSubGoal(goalId: string, text: string): Promise<{ success: boolean; error?: string; subGoal?: SubGoal }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Get current goal
    const { data: goal, error: fetchError } = await (supabase as any)
        .from('goals')
        .select('sub_goals')
        .eq('id', goalId)
        .eq('user_id', user.id)
        .single();

    if (fetchError) return { success: false, error: fetchError.message };

    const newSubGoal: SubGoal = {
        id: crypto.randomUUID(),
        text,
        completed: false
    };

    const updatedSubGoals = [...(goal.sub_goals || []), newSubGoal];

    const { error } = await (supabase as any)
        .from('goals')
        .update({ sub_goals: updatedSubGoals })
        .eq('id', goalId)
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/goals');
    return { success: true, subGoal: newSubGoal };
}

export async function toggleSubGoal(goalId: string, subGoalId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Get current goal
    const { data: goal, error: fetchError } = await (supabase as any)
        .from('goals')
        .select('sub_goals')
        .eq('id', goalId)
        .eq('user_id', user.id)
        .single();

    if (fetchError) return { success: false, error: fetchError.message };

    const updatedSubGoals = (goal.sub_goals || []).map((sg: SubGoal) =>
        sg.id === subGoalId ? { ...sg, completed: !sg.completed } : sg
    );

    const { error } = await (supabase as any)
        .from('goals')
        .update({ sub_goals: updatedSubGoals })
        .eq('id', goalId)
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/goals');
    return { success: true };
}

export async function reorderGoals(period: GoalPeriod, goalIds: string[]): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
        // Update order_index for each goal
        for (let i = 0; i < goalIds.length; i++) {
            await (supabase as any)
                .from('goals')
                .update({ order_index: i })
                .eq('id', goalIds[i])
                .eq('user_id', user.id)
                .eq('period', period);
        }

        revalidatePath('/goals');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
