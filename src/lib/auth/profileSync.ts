'use server';

import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Syncs user profile from Supabase Auth user metadata
 * This handles Google OAuth users and ensures profile exists with correct data
 */
export async function syncUserProfile(user: User) {
    try {
        const supabase = await createClient();

        // Get user metadata
        const metadata = user.user_metadata || {};
        const appMetadata = user.app_metadata || {};

        // Determine provider (check identities array first)
        // Supabase stores provider info in the identities array
        const identities = user.identities || [];
        const googleIdentity = identities.find((id: any) => id.provider === 'google');
        // Check app_metadata for provider as fallback
        const appProvider = (appMetadata as any)?.provider;
        const provider = googleIdentity ? 'google' : (appProvider || metadata.provider || 'email');

        // Extract profile data from metadata
        const profileData: {
            full_name?: string;
            avatar_url?: string | null;
            provider?: string;
            country?: string | null;
            timezone?: string | null;
        } = {
            full_name: metadata.full_name || metadata.name || user.email?.split('@')[0] || '',
            avatar_url: metadata.avatar_url || metadata.picture || null,
            provider: provider,
        };

        // Try to get country and timezone if available
        if (metadata.country) {
            profileData.country = metadata.country;
        }
        if (metadata.timezone) {
            profileData.timezone = metadata.timezone;
        }

        // Check if profile exists and get full data
        const { data: existingProfile } = await (supabase as any)
            .from('profiles')
            .select('id, full_name, avatar_url, provider, country, timezone, trial_end')
            .eq('id', user.id)
            .single();

        if (existingProfile) {
            // Update existing profile - only update missing/null fields
            const updateData: any = {};

            if (profileData.full_name && !existingProfile.full_name) {
                updateData.full_name = profileData.full_name;
            }
            if (profileData.avatar_url && !existingProfile.avatar_url) {
                updateData.avatar_url = profileData.avatar_url;
            }
            if (profileData.provider && (!existingProfile.provider || existingProfile.provider === 'email')) {
                updateData.provider = profileData.provider;
            }
            if (profileData.country && !existingProfile.country) {
                updateData.country = profileData.country;
            }
            if (profileData.timezone && !existingProfile.timezone) {
                updateData.timezone = profileData.timezone;
            }

            // SET TRIAL FOR OAUTH USERS WHO DON'T HAVE ONE
            // This ensures Google OAuth users who signed up before trial system get a trial
            if (!existingProfile.trial_end) {
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + 14);
                updateData.trial_end = trialEnd.toISOString();
                console.log('Setting trial for existing OAuth user:', user.id);
            }

            // Only update if there's something to update
            if (Object.keys(updateData).length > 0) {
                const { error } = await (supabase as any)
                    .from('profiles')
                    .update(updateData)
                    .eq('id', user.id);

                if (error) {
                    console.error('Error updating profile:', error);
                }
            }
        } else {
            // Profile doesn't exist - database trigger should have created it
            // Wait briefly for trigger to complete, then retry once
            console.log('Profile not found for user, waiting for trigger to create it:', user.id);

            // Wait 1 second for trigger to complete
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check one more time
            const { data: retryProfile } = await (supabase as any)
                .from('profiles')
                .select('id, full_name, avatar_url, provider, country, timezone, trial_end')
                .eq('id', user.id)
                .maybeSingle();

            if (!retryProfile) {
                // Profile still doesn't exist - trigger may have failed
                // Log error but don't create profile manually (frontend should only read/update)
                console.error('Profile still does not exist after waiting. Database trigger may have failed.');
                return {
                    success: false,
                    error: 'Profile not found. Please contact support if this persists.'
                };
            }

            // Profile now exists (created by trigger), update it with OAuth data and trial
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 14);

            const updateData: any = {};
            if (profileData.full_name && !retryProfile.full_name) updateData.full_name = profileData.full_name;
            if (profileData.avatar_url && !retryProfile.avatar_url) updateData.avatar_url = profileData.avatar_url;
            if (profileData.provider && (!retryProfile.provider || retryProfile.provider === 'email')) {
                updateData.provider = profileData.provider;
            }
            if (profileData.country && !retryProfile.country) updateData.country = profileData.country;
            if (profileData.timezone && !retryProfile.timezone) updateData.timezone = profileData.timezone;
            
            // Set trial if not already set
            if (!retryProfile.trial_end) {
                updateData.trial_end = trialEnd.toISOString();
            }

            // Only update if there's something to update
            if (Object.keys(updateData).length > 0) {
                const { error: updateError } = await (supabase as any)
                    .from('profiles')
                    .update(updateData)
                    .eq('id', user.id);

                if (updateError) {
                    console.error('Error updating newly created profile:', updateError);
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error syncing profile:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

