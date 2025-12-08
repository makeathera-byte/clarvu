'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface LoginFormData {
    email: string;
    password: string;
}

export interface LoginResult {
    success: boolean;
    error?: string;
}

export async function loginAction(formData: LoginFormData): Promise<LoginResult> {
    try {
        // Validate environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('Missing Supabase environment variables');
            return { success: false, error: 'Server configuration error. Please contact support.' };
        }

        const supabase = await createClient();

        // Validate input
        if (!formData.email || !formData.password) {
            return { success: false, error: 'Email and password are required' };
        }

        // Sign in the user
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (error) {
            console.error('Login auth error:', error);
            return { success: false, error: error.message };
        }

        if (!data.session) {
            return { success: false, error: 'Login failed - no session returned' };
        }

        // Update last_login timestamp in profile
        // Using type assertion due to Supabase strict typing
        try {
            await (supabase as any)
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.session.user.id);
        } catch (profileError) {
            console.error('Error updating last_login:', profileError);
            // Don't fail login if profile update fails
        }

        // Redirect to dashboard
        redirect('/dashboard');
    } catch (error) {
        console.error('Unexpected login error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
            error: error,
        });
        
        // Check if this is a redirect (Next.js redirect throws an error)
        if (error && typeof error === 'object' && 'digest' in error) {
            const redirectError = error as { digest?: string };
            if (redirectError.digest?.includes('NEXT_REDIRECT')) {
                // This is a redirect, re-throw it
                throw error;
            }
        }
        
        let errorMessage = 'An unexpected error occurred during login';
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

export async function logoutAction(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
}
