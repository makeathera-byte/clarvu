'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Get Profile
export async function getProfile() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) return { error: error.message };

    return {
        success: true,
        profile: {
            full_name: data.full_name || '',
            bio: data.bio || '',
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            country: data.country || '',
            email: user.email || '',
        }
    };
}

// Update Profile
export async function updateProfileAction(data: {
    full_name?: string;
    bio?: string;
    timezone?: string;
    country?: string;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('profiles')
        .update(data)
        .eq('id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/settings/profile');
    return { success: true };
}

// Update Theme Settings
export async function updateThemeSettingsAction(data: {
    theme_name?: string;
    custom_primary?: string;
    custom_accent?: string;
    glass_opacity?: number;
    ui_density?: 'compact' | 'normal' | 'cozy';
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('profiles')
        .update(data)
        .eq('id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/settings/theme');
    return { success: true };
}

// Update Wallpaper Settings
export async function updateWallpaperAction(data: {
    wallpaper?: string;
    wallpaper_blur?: number;
    wallpaper_brightness?: number;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('profiles')
        .update(data)
        .eq('id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/settings/wallpaper');
    return { success: true };
}

// Update Notification Settings
export async function updateNotificationSettingsAction(data: {
    notify_timer_end?: boolean;
    notify_scheduled_tasks?: boolean;
    notify_daily_summary?: boolean;
    email_weekly_summary?: boolean;
    email_monthly_report?: boolean;
    activity_reminder_minutes?: number;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('profiles')
        .update(data)
        .eq('id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/settings/notifications');
    return { success: true };
}

// Update Timer Settings
export async function updateTimerSettingsAction(data: {
    default_timer_minutes?: number;
    auto_start_next?: boolean;
    auto_complete_tasks?: boolean;
    default_break_minutes?: number;
    enable_immersive_focus?: boolean;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('profiles')
        .update(data)
        .eq('id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/settings/timer');
    return { success: true };
}

// Update AI Settings
export async function updateAISettingsAction(data: {
    ai_personality?: 'coach' | 'strict' | 'friendly' | 'minimal';
    ai_routine_tone?: 'professional' | 'casual' | 'minimal';
    ai_summary_depth?: 'short' | 'medium' | 'detailed';
    explain_insights?: boolean;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('profiles')
        .update(data)
        .eq('id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/settings/ai');
    return { success: true };
}

// Category CRUD
export async function createCategoryAction(data: { name: string; color: string }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: newCategory, error } = await (supabase as any)
        .from('categories')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

    if (error) return { error: error.message };

    revalidatePath('/settings/categories');
    return { success: true, category: newCategory };
}

export async function updateCategoryAction(id: string, data: { name?: string; color?: string }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: updatedCategory, error } = await (supabase as any)
        .from('categories')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) return { error: error.message };

    revalidatePath('/settings/categories');
    return { success: true, category: updatedCategory };
}

export async function deleteCategoryAction(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/settings/categories');
    return { success: true };
}

export async function getCategories() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (error) return { error: error.message };

    return { categories: data };
}

// Security Actions
export async function deleteAccountAction() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // Soft delete - mark as disabled
    const { error } = await (supabase as any)
        .from('profiles')
        .update({ disabled: true })
        .eq('id', user.id);

    if (error) return { error: error.message };

    // Sign out
    await supabase.auth.signOut();

    return { success: true };
}

export async function requestPasswordResetAction() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return { error: 'No email found' };

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/settings/security`,
    });

    if (error) return { error: error.message };

    return { success: true };
}
