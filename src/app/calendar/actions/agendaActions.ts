'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'all_day';

interface CreateAgendaBlockData {
    title: string;
    description?: string;
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    time_of_day?: TimeOfDay;
    color?: string;
    linked_goal_id?: string;
}

interface UpdateAgendaBlockData {
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    time_of_day?: TimeOfDay;
    color?: string;
    linked_goal_id?: string;
}

/**
 * Create a new agenda block
 */
export async function createAgendaBlock(data: CreateAgendaBlockData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { block: null, error: 'Not authenticated' };
    }

    const { data: block, error } = await (supabase as any)
        .from('agenda_blocks')
        .insert({
            user_id: user.id,
            title: data.title,
            description: data.description || null,
            start_date: data.start_date,
            end_date: data.end_date,
            time_of_day: data.time_of_day || 'all_day',
            color: data.color || '#6b7280',
            linked_goal_id: data.linked_goal_id || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating agenda block:', error);
        return { block: null, error: error.message };
    }

    revalidatePath('/calendar');
    return { block, error: null };
}

/**
 * Update an existing agenda block
 */
export async function updateAgendaBlock(id: string, data: UpdateAgendaBlockData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { block: null, error: 'Not authenticated' };
    }

    const updateData: any = {
        updated_at: new Date().toISOString(),
    };

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.start_date) updateData.start_date = data.start_date;
    if (data.end_date) updateData.end_date = data.end_date;
    if (data.time_of_day) updateData.time_of_day = data.time_of_day;
    if (data.color) updateData.color = data.color;
    if (data.linked_goal_id !== undefined) updateData.linked_goal_id = data.linked_goal_id;

    const { data: block, error } = await (supabase as any)
        .from('agenda_blocks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating agenda block:', error);
        return { block: null, error: error.message };
    }

    revalidatePath('/calendar');
    return { block, error: null };
}

/**
 * Delete an agenda block
 */
export async function deleteAgendaBlock(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('agenda_blocks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting agenda block:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/calendar');
    return { success: true, error: null };
}
