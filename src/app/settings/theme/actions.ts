'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface UpdateThemeResult {
    success: boolean;
    error?: string;
}

export async function updateThemeAction(themeName: string): Promise<UpdateThemeResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Update theme in profile
    // Using type assertion due to Supabase strict typing
    const { error } = await (supabase as any)
        .from('profiles')
        .update({
            theme_name: themeName,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    // Revalidate pages that depend on theme
    revalidatePath('/dashboard');
    revalidatePath('/settings/theme');

    return { success: true };
}

export async function updateCustomThemeAction(
    primaryColor: string,
    accentColor: string,
    wallpaperUrl?: string
): Promise<UpdateThemeResult> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Update custom theme colors in profile
    // Using type assertion due to Supabase strict typing
    const { error } = await (supabase as any)
        .from('profiles')
        .update({
            primary_color: primaryColor,
            accent_color: accentColor,
            wallpaper_url: wallpaperUrl ?? null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    // Revalidate pages that depend on theme
    revalidatePath('/dashboard');
    revalidatePath('/settings/theme');

    return { success: true };
}
