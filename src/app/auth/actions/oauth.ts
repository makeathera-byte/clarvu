'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function signInWithGoogle() {
    try {
        const supabase = await createClient();
        const origin = (await headers()).get('origin') || 'http://localhost:3000';

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${origin}/api/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            console.error('Google OAuth error:', error);
            return {
                success: false,
                error: error.message || 'Failed to initiate Google sign-in'
            };
        }

        return {
            success: true,
            url: data.url
        };
    } catch (error) {
        console.error('Google OAuth error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.'
        };
    }
}
