'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginWithEmail(email: string, password: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                error: error.message || 'Invalid email or password'
            };
        }

        if (!data.user) {
            return {
                success: false,
                error: 'Login failed. Please try again.'
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.'
        };
    }
}
