'use server';

import { createClient } from '@/lib/supabase/server';

export async function signupWithEmail(
    name: string,
    email: string,
    password: string
) {
    try {
        const supabase = await createClient();

        // Validate inputs
        if (!name || name.trim().length === 0) {
            return { success: false, error: 'Name is required' };
        }

        if (!email || !email.includes('@')) {
            return { success: false, error: 'Valid email is required' };
        }

        if (!password || password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Sign up with metadata (default theme, will be updated in onboarding)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name.trim(),
                    name: name.trim(),
                    theme_name: 'forest', // Default theme
                },
            },
        });

        if (error) {
            // Handle specific error cases
            if (error.message.includes('already registered')) {
                return {
                    success: false,
                    error: 'This email is already registered. Please login instead.'
                };
            }
            return {
                success: false,
                error: error.message || 'Failed to create account'
            };
        }

        if (!data.user) {
            return {
                success: false,
                error: 'Failed to create account. Please try again.'
            };
        }

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Signup error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.'
        };
    }
}
