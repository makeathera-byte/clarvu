'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type GoalPeriod = '7d' | '30d' | '365d';
export type GoalStatus = 'active' | 'completed' | 'missed';
export type GoalOutcome = 'yes' | 'partially' | 'no';

interface CreateGoalData {
    title: string;
    description?: string;
    period: GoalPeriod;
    progress_percentage?: number;
    priority?: 'high' | 'medium' | 'low';
}

interface UpdateGoalData {
    title?: string;
    description?: string;
    progress_percentage?: number;
    priority?: 'high' | 'medium' | 'low';
    status?: GoalStatus;
}

/**
 * Calculate end date based on goal period
 */
function calculateEndDate(startDate: Date, period: GoalPeriod): Date {
    const end = new Date(startDate);

    switch (period) {
        case '7d':
            end.setDate(end.getDate() + 7);
            break;
        case '30d':
            end.setDate(end.getDate() + 30);
            break;
        case '365d':
            end.setFullYear(end.getFullYear() + 1);
            break;
    }

    return end;
}

/**
 * Create a new goal
 */
export async function createGoal(data: CreateGoalData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { goal: null, error: 'Not authenticated' };
    }

    const startDate = new Date();
    const endDate = calculateEndDate(startDate, data.period);

    const { data: goal, error } = await (supabase as any)
        .from('goals')
        .insert({
            user_id: user.id,
            goal_text: data.title,
            notes: data.description || null,
            period: data.period,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            status: 'active',
            progress_percentage: data.progress_percentage || 0,
            priority: data.priority || 'medium',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating goal:', error);
        return { goal: null, error: error.message };
    }

    revalidatePath('/calendar');
    return { goal, error: null };
}

/**
 * Update an existing goal
 */
export async function updateGoal(id: string, data: UpdateGoalData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { goal: null, error: 'Not authenticated' };
    }

    const updateData: any = {
        updated_at: new Date().toISOString(),
    };

    if (data.title) updateData.goal_text = data.title;
    if (data.description !== undefined) updateData.notes = data.description;
    if (data.progress_percentage !== undefined) updateData.progress_percentage = data.progress_percentage;
    if (data.priority) updateData.priority = data.priority;
    if (data.status) updateData.status = data.status;

    const { data: goal, error } = await (supabase as any)
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating goal:', error);
        return { goal: null, error: error.message };
    }

    revalidatePath('/calendar');
    return { goal, error: null };
}

/**
 * Delete a goal
 */
export async function deleteGoal(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting goal:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/calendar');
    return { success: true, error: null };
}

/**
 * Complete a goal with outcome
 */
export async function completeGoal(id: string, outcome: GoalOutcome) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { goal: null, error: 'Not authenticated' };
    }

    // Map outcome to status and progress
    let status: GoalStatus;
    let progress: number;

    switch (outcome) {
        case 'yes':
            status = 'completed';
            progress = 100;
            break;
        case 'partially':
            status = 'completed';
            progress = 50; // or keep existing progress
            break;
        case 'no':
            status = 'missed';
            progress = 0;
            break;
    }

    const { data: goal, error } = await (supabase as any)
        .from('goals')
        .update({
            status,
            progress_percentage: progress,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error completing goal:', error);
        return { goal: null, error: error.message };
    }

    revalidatePath('/calendar');
    return { goal, error: null };
}

/**
 * Get goals that have ended but not been completed/missed
 */
export async function getEndedGoals() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { goals: [], error: 'Not authenticated' };
    }

    const now = new Date().toISOString();

    const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lt('end_date', now)
        .order('end_date', { ascending: true });

    if (error) {
        console.error('Error fetching ended goals:', error);
        return { goals: [], error: error.message };
    }

    return { goals: goals || [], error: null };
}
