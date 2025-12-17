'use server';

import { createClient } from '@/lib/supabase/server';

export async function saveOnboardingData(country: string, theme: string) {
    console.log('[saveOnboardingData] Starting...', { country, theme });

    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        console.log('[saveOnboardingData] User check:', { userId: user?.id, error: userError });

        if (userError || !user) {
            console.error('[saveOnboardingData] Authentication error:', userError);
            return {
                success: false,
                error: 'Not authenticated. Please sign in again.'
            };
        }

        // First, check if profile exists
        const { data: existingProfile, error: fetchError } = await (supabase as any)
            .from('profiles')
            .select('id, country, theme_name, onboarding_complete')
            .eq('id', user.id)
            .single();

        console.log('[saveOnboardingData] Existing profile:', { existingProfile, fetchError });

        // Update profile with country and theme
        const { data: updateData, error: updateError } = await (supabase as any)
            .from('profiles')
            .update({
                country,
                theme_name: theme,
                onboarding_complete: true,
            })
            .eq('id', user.id)
            .select();

        console.log('[saveOnboardingData] Update result:', { updateData, updateError });

        if (updateError) {
            console.error('[saveOnboardingData] Error updating profile:', updateError);
            return {
                success: false,
                error: `Failed to save preferences: ${updateError.message || 'Unknown error'}`
            };
        }

        // Verify the update worked
        if (!updateData || updateData.length === 0) {
            console.error('[saveOnboardingData] Update returned no data');
            return {
                success: false,
                error: 'Profile update failed. No data returned.'
            };
        }

        console.log('[saveOnboardingData] Success! Profile updated:', updateData[0]);
        return { success: true };
    } catch (error) {
        console.error('[saveOnboardingData] Unexpected error:', error);
        return {
            success: false,
            error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
