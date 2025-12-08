'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Keys for category in notifications: reminder, task, ai_summary, calendar, integration, admin, system

export async function getNotifications(limit = 50) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return { error: error.message };
    return { notifications: data };
}

export async function getUnreadCount() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { count: 0 };

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

    if (error) return { count: 0 };
    return { count: count || 0 };
}

export async function markNotificationRead(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/notifications');
    return { success: true };
}

export async function markAllNotificationsRead() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

    if (error) return { error: error.message };

    revalidatePath('/notifications');
    return { success: true };
}

export async function deleteNotification(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/notifications');
    return { success: true };
}

export async function deleteAllNotifications() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/notifications');
    return { success: true };
}

export async function sendNotificationToUser(
    userId: string,
    payload: { title: string; body: string; category: string }
) {
    const supabase = await createClient();

    const { error } = await (supabase as any)
        .from('notifications')
        .insert({
            user_id: userId,
            title: payload.title,
            body: payload.body,
            category: payload.category,
        });

    if (error) return { error: error.message };
    return { success: true };
}

export async function sendBroadcastNotification(
    payload: { title: string; body: string; category?: string }
) {
    const supabase = await createClient();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) return { error: 'Admin access required' };

    // Get all user IDs
    const { data: users } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('disabled', false);

    if (!users || users.length === 0) return { error: 'No users found' };

    // Insert notification for each user
    const notifications = users.map((u: { id: string }) => ({
        user_id: u.id,
        title: payload.title,
        body: payload.body,
        category: payload.category || 'admin',
    }));

    const { error } = await (supabase as any)
        .from('notifications')
        .insert(notifications);

    if (error) return { error: error.message };
    return { success: true, count: users.length };
}
