'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface CreateTaskFormData {
    title: string;
    categoryId: string | null;
    startTime: string; // ISO string
    priority: 'low' | 'medium' | 'high';
    isScheduled: boolean;
}

export interface CreateTaskResult {
    success?: boolean;
    error?: string;
    task?: {
        id: string;
        title: string;
        status: string;
        priority: string;
        isScheduled: boolean;
    };
}

export async function createTaskAction(formData: CreateTaskFormData): Promise<CreateTaskResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Determine status based on scheduling preference
    let status: string;
    let startTime: string | null;

    if (!formData.isScheduled) {
        // Unscheduled tasks go into backlog
        status = 'unscheduled';
        startTime = null;
    } else {
        // Scheduled tasks: determine if they should start now or later
        const start = new Date(formData.startTime);
        const now = new Date();
        status = start > now ? 'scheduled' : 'in_progress';
        startTime = start.toISOString();
    }

    // Create the task
    const { data, error } = await (supabase as any)
        .from('tasks')
        .insert({
            user_id: user.id,
            title: formData.title,
            category_id: formData.categoryId || null,
            start_time: startTime,
            status,
            duration_minutes: 30, // Default 30-minute slots
            priority: formData.priority,
            is_scheduled: formData.isScheduled,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // Revalidate dashboard to show new task
    revalidatePath('/dashboard');

    return {
        success: true,
        task: {
            id: data.id,
            title: data.title,
            status: data.status,
            priority: data.priority,
            isScheduled: data.is_scheduled,
        }
    };
}
