'use server';

import { createClient } from '@/lib/supabase/server';

export async function saveOnboardingData(country: string, theme: string) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // Update profile with country and theme
        const { error: updateError } = await (supabase as any)
            .from('profiles')
            .update({
                country,
                theme_name: theme,
                onboarding_complete: true,
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return {
                success: false,
                error: 'Failed to save preferences'
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Onboarding error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred'
        };
    }
}
