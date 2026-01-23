'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Sign in with Google using ID token from Google Identity Services
 * This replaces the Supabase-managed OAuth flow with Clarvu-owned OAuth
 */
export async function signInWithGoogleIdToken(idToken: string) {
    try {
        if (!idToken) {
            return {
                success: false,
                error: 'No ID token provided'
            };
        }

        const supabase = await createClient();

        // Use signInWithIdToken instead of signInWithOAuth
        // This allows Clarvu to own the OAuth client and show Clarvu branding
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });

        if (error) {
            console.error('Google ID token sign-in error:', error);
            return {
                success: false,
                error: error.message || 'Failed to sign in with Google'
            };
        }

        if (!data.user) {
            return {
                success: false,
                error: 'Authentication failed. Please try again.'
            };
        }

        return {
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                avatar: data.user.user_metadata?.avatar_url,
            }
        };
    } catch (error) {
        console.error('Google ID token sign-in error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.'
        };
    }
}

/**
 * Sign out the current user
 */
export async function signOut() {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: error.message
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return {
            success: false,
            error: 'Failed to sign out'
        };
    }
}
