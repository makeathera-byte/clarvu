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
        // Use maybeSingle() to avoid errors when profile doesn't exist or RLS blocks access
        let existingProfile = null;
        
        const { data: initialProfileData, error: initialError } = await (supabase as any)
            .from('profiles')
            .select('id, full_name, avatar_url, provider, country, timezone, trial_end')
            .eq('id', user.id)
            .maybeSingle();
        
        existingProfile = initialProfileData;

        // If profile not found, it might be RLS blocking access or timing issue
        // Wait a bit for session to be fully established, then retry
        if (!existingProfile) {
            console.log('Profile not found initially, waiting for session/trigger to establish...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry once after waiting
            const retryResult = await (supabase as any)
                .from('profiles')
                .select('id, full_name, avatar_url, provider, country, timezone, trial_end')
                .eq('id', user.id)
                .maybeSingle();
            
            if (retryResult.data) {
                // Profile found on retry - RLS or timing was the issue
                existingProfile = retryResult.data;
                console.log('✅ Profile found on retry - session/trigger is now established');
            }
        }

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
            // Wait for trigger to complete with multiple retries
            console.log('Profile not found for user, waiting for trigger to create it:', user.id);

            // Retry multiple times with increasing delays to handle timing issues
            let retryProfile = null;
            const maxRetries = 5;
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
                
                const { data: profile, error: profileError } = await (supabase as any)
                    .from('profiles')
                    .select('id, full_name, avatar_url, provider, country, timezone, trial_end')
                    .eq('id', user.id)
                    .maybeSingle();
                
                if (profile) {
                    retryProfile = profile;
                    console.log(`✅ Profile found after ${attempt + 1} retry attempt(s)`);
                    break;
                }
                
                if (profileError && profileError.code !== 'PGRST116') {
                    // PGRST116 is "not found", other errors are real issues
                    console.warn(`Profile check error (attempt ${attempt + 1}):`, profileError);
                }
            }

            if (!retryProfile) {
                // Trigger may have failed or there's a delay - use service role to create profile
                console.warn('Profile not found after multiple retries. Creating profile with service role as fallback...');

                try {
                    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
                    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

                    if (!serviceRoleKey || !supabaseUrl) {
                        console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
                        return { success: false, error: 'Server configuration error' };
                    }

                    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey, {
                        auth: { autoRefreshToken: false, persistSession: false }
                    });

                    const trialEnd = new Date();
                    trialEnd.setDate(trialEnd.getDate() + 14);

                    // Upsert profile (insert or update if already exists from trigger)
                    const { error: upsertError } = await serviceClient
                        .from('profiles')
                        .upsert({
                            id: user.id,
                            full_name: profileData.full_name || '',
                            avatar_url: profileData.avatar_url,
                            provider: profileData.provider,
                            country: profileData.country,
                            timezone: profileData.timezone || 'UTC',
                            theme_name: metadata.theme_name || 'forest',
                            trial_end: trialEnd.toISOString(),
                            onboarding_complete: false,
                        }, {
                            onConflict: 'id'
                        });

                    if (upsertError) {
                        console.error('Service role upsert failed:', upsertError);
                        return { success: false, error: 'Failed to create profile' };
                    }

                    // Create default categories
                    await serviceClient.from('categories').insert([
                        { user_id: user.id, name: 'Business', color: '#2563eb', type: 'growth', is_default: true },
                        { user_id: user.id, name: 'Growth', color: '#22c55e', type: 'growth', is_default: true },
                        { user_id: user.id, name: 'Product / Build', color: '#8b5cf6', type: 'delivery', is_default: true },
                        { user_id: user.id, name: 'Operations / Admin', color: '#6b7280', type: 'admin', is_default: true },
                        { user_id: user.id, name: 'Learning / Skill', color: '#4f46e5', type: 'personal', is_default: true },
                        { user_id: user.id, name: 'Personal / Health', color: '#facc15', type: 'personal', is_default: true },
                        { user_id: user.id, name: 'Routine', color: '#fb923c', type: 'necessity', is_default: true },
                        { user_id: user.id, name: 'Waste / Distraction', color: '#ef4444', type: 'waste', is_default: true },
                    ]);

                    console.log('Profile created successfully with service role');
                } catch (error) {
                    console.error('Service role creation error:', error);
                    return { success: false, error: 'Failed to create profile' };
                }
            } else {
                // Profile exists, update with OAuth data and trial
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

                if (!retryProfile.trial_end) {
                    updateData.trial_end = trialEnd.toISOString();
                }

                if (Object.keys(updateData).length > 0) {
                    const { error: updateError } = await (supabase as any)
                        .from('profiles')
                        .update(updateData)
                        .eq('id', user.id);

                    if (updateError) {
                        console.error('Error updating profile:', updateError);
                    }
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error syncing profile:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

