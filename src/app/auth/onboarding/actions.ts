/**
 * OAuth Onboarding Actions
 * 
 * Updates profile with country and timezone for OAuth users
 */

'use server';

import { createClient } from '@/lib/supabase/server';

interface OnboardingData {
    country: string;
    timezone: string;
}

export async function completeOnboarding(data: OnboardingData) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Validate inputs
        if (!data.country || !data.timezone) {
            return { success: false, error: 'Country and timezone are required' };
        }

        // Update profile
        const { error: updateError } = await (supabase as any)
            .from('profiles')
            .update({
                country: data.country,
                timezone: data.timezone,
                onboarding_complete: true,
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return { success: false, error: 'Failed to update profile' };
        }

        return { success: true };
    } catch (error) {
        console.error('Onboarding error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
