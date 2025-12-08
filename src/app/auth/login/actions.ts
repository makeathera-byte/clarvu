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
        return { success: false, error: error.message };
    }

    if (!data.session) {
        return { success: false, error: 'Login failed - no session returned' };
    }

    // Update last_login timestamp in profile
    // Using type assertion due to Supabase strict typing
    await (supabase as any)
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.session.user.id);

    // Redirect to dashboard
    redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
}
