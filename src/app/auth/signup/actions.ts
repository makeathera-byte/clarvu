'use server';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export interface SignupFormData {
    fullName: string;
    email: string;
    password: string;
    themeName: string;
    country: string;
    timezone: string;
}

export interface SignupResult {
    success: boolean;
    error?: string;
}

export async function signUpAction(formData: SignupFormData): Promise<SignupResult> {
    try {
        const supabase = await createClient();

        // Validate input
        if (!formData.email || !formData.password || !formData.fullName) {
            return { success: false, error: 'All fields are required' };
        }

        if (formData.password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Get redirect URL from environment or use default
        const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`
            : typeof window !== 'undefined'
                ? `${window.location.origin}/auth/login`
                : '/auth/login';

        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    full_name: formData.fullName,
                    theme_name: formData.themeName,
                    country: formData.country,
                    timezone: formData.timezone,
                },
            },
        });

        if (error) {
            console.error('Signup auth error:', error);
            return { success: false, error: error.message };
        }

        if (!data.user) {
            return { success: false, error: 'Signup failed - no user returned' };
        }

        // The database trigger will automatically create the profile
        // Wait briefly for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Calculate 14-day trial end date for all new signups
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);

        // Try to update the profile with all signup fields
        // The profile should already exist from the trigger
        // Note: Profiles are created ONLY via database trigger, frontend only updates
        const updatePayload = {
            full_name: formData.fullName,
            theme_name: formData.themeName,
            country: formData.country,
            timezone: formData.timezone,
            trial_end: trialEnd.toISOString(),
        };

        // TypeScript has issues inferring the update type, so we cast the entire chain
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await ((supabase as any)
            .from('profiles')
            .update(updatePayload)
            .eq('id', data.user.id));

        if (profileError) {
            console.error('Profile update error:', profileError);
            // Don't fail signup - the profile was created by trigger with default values
            // The user can update their profile later in settings or onboarding
        }

        // Verify default categories were created, create them if not (fallback)
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('id')
            .eq('user_id', data.user.id)
            .limit(1);

        if (categoriesError) {
            console.error('Error checking categories:', categoriesError);
            // Don't fail signup if category check fails, but log it
        } else if (!categories || categories.length === 0) {
            console.warn('Default categories not created by trigger, creating manually');
            // Create 8 business-focused default categories
            const defaultCategories = [
                { user_id: data.user.id, name: 'Business', color: '#2563eb', type: 'growth', is_default: true },
                { user_id: data.user.id, name: 'Growth', color: '#22c55e', type: 'growth', is_default: true },
                { user_id: data.user.id, name: 'Product / Build', color: '#8b5cf6', type: 'delivery', is_default: true },
                { user_id: data.user.id, name: 'Operations / Admin', color: '#6b7280', type: 'admin', is_default: true },
                { user_id: data.user.id, name: 'Learning / Skill', color: '#4f46e5', type: 'personal', is_default: true },
                { user_id: data.user.id, name: 'Personal / Health', color: '#facc15', type: 'personal', is_default: true },
                { user_id: data.user.id, name: 'Routine', color: '#fb923c', type: 'necessity', is_default: true },
                { user_id: data.user.id, name: 'Waste / Distraction', color: '#ef4444', type: 'waste', is_default: true },
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: insertError } = await supabase
                .from('categories')
                .insert(defaultCategories as any);

            if (insertError) {
                console.error('Error creating default categories:', insertError);
                // Don't fail signup if category creation fails, but log it
            }
        }

        // Return success - let the client handle the verification modal
        return { success: true };
    } catch (error) {
        console.error('Unexpected signup error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
            error: error,
        });

        let errorMessage = 'An unexpected error occurred during signup';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else {
            try {
                errorMessage = JSON.stringify(error);
            } catch {
                errorMessage = String(error);
            }
        }

        return { success: false, error: errorMessage };
    }
}
