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

        // Check if profile exists
        const { data: existingProfile } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (existingProfile) {
            // Update existing profile - only update missing/null fields
            const updateData: typeof profileData = {};
            
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
            // Create new profile
            const { error } = await (supabase as any)
                .from('profiles')
                .insert({
                    id: user.id,
                    full_name: profileData.full_name,
                    avatar_url: profileData.avatar_url,
                    provider: profileData.provider,
                    country: profileData.country,
                    timezone: profileData.timezone || 'UTC',
                    theme_name: metadata.theme_name || 'forest',
                    onboarding_complete: false,
                });

            if (error) {
                console.error('Error creating profile:', error);
                // Profile might be created by trigger, that's okay
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error syncing profile:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

