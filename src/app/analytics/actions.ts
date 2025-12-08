'use server';

import { createClient } from '@/lib/supabase/server';

interface AnalyticsTask {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    created_at: string;
}

interface AnalyticsCategory {
    id: string;
    name: string;
    color: string;
    type: string;
}

export async function fetchAnalyticsTasks(days: number = 30): Promise<AnalyticsTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await (supabase as any)
        .from('tasks')
        .select('id, title, status, start_time, end_time, duration_minutes, category_id, created_at')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .order('start_time', { ascending: false });

    if (error) {
        console.error('Error fetching analytics tasks:', error);
        return [];
    }

    return data || [];
}

export async function fetchAllCategories(): Promise<AnalyticsCategory[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
        .from('categories')
        .select('id, name, color, type')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data || [];
}

export async function fetchTodayTasksForAnalytics(): Promise<AnalyticsTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await (supabase as any)
        .from('tasks')
        .select('id, title, status, start_time, end_time, duration_minutes, category_id, created_at')
        .eq('user_id', user.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching today tasks:', error);
        return [];
    }

    return data || [];
}

export async function fetchYesterdayTasks(): Promise<AnalyticsTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await (supabase as any)
        .from('tasks')
        .select('id, title, status, start_time, end_time, duration_minutes, category_id, created_at')
        .eq('user_id', user.id)
        .gte('start_time', yesterday.toISOString())
        .lt('start_time', today.toISOString())
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching yesterday tasks:', error);
        return [];
    }

    return data || [];
}
