/**
 * Google Sign-In Button Component
 * 
 * Triggers Google OAuth flow for authentication
 */

'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { FcGoogle } from 'react-icons/fc';

interface GoogleSignInButtonProps {
    mode?: 'signin' | 'signup';
}

export function GoogleSignInButton({ mode = 'signin' }: GoogleSignInButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);

        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) {
                console.error('Google sign-in error:', error);
                alert('Failed to sign in with Google. Please try again.');
                setIsLoading(false);
            }
            // If successful, user will be redirected to Google
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <FcGoogle className="w-5 h-5" />
            <span>{isLoading ? 'Connecting...' : `Continue with Google`}</span>
        </button>
    );
}
