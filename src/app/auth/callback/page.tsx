'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

/**
 * OAuth Callback Handler (Client Component)
 * 
 * Handles the OAuth callback and exchanges the code for a session.
 * Using client component because Supabase may return tokens in URL hash (#)
 * which server components cannot access.
 */
export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('🔄 Processing OAuth callback...');

                // Check for errors in query params
                const error = searchParams.get('error');
                const errorDescription = searchParams.get('error_description');

                if (error) {
                    console.error('❌ OAuth error:', error, errorDescription);
                    setStatus('error');
                    setErrorMessage(errorDescription || error);
                    setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`), 2000);
                    return;
                }

                // Exchange the code for session using Supabase's built-in method
                // This handles both hash and query param based OAuth responses
                const { data, error: authError } = await supabaseClient.auth.exchangeCodeForSession(
                    window.location.href
                );

                if (authError) {
                    console.error('❌ Error exchanging code for session:', authError);
                    setStatus('error');
                    setErrorMessage(authError.message);
                    setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(authError.message)}`), 2000);
                    return;
                }

                if (!data.session?.user) {
                    console.error('❌ No session after code exchange');
                    setStatus('error');
                    setErrorMessage('Failed to establish session');
                    setTimeout(() => router.push('/auth/login?error=Failed+to+establish+session'), 2000);
                    return;
                }

                const user = data.session.user;
                console.log('✅ OAuth callback: User authenticated:', user.id);

                // Call server action to sync profile
                try {
                    const { syncUserProfile } = await import('@/lib/auth/profileSync');
                    const syncResult = await syncUserProfile(user);

                    if (!syncResult.success) {
                        console.warn('⚠️ Profile sync had issues, but continuing:', syncResult.error);
                    } else {
                        console.log('✅ Profile sync successful');
                    }
                } catch (syncErr) {
                    console.error('❌ Profile sync error, but continuing:', syncErr);
                }

                // Update last_login timestamp
                try {
                    await (supabaseClient as any)
                        .from('profiles')
                        .update({ last_login: new Date().toISOString() })
                        .eq('id', user.id);
                } catch (updateErr) {
                    console.error('Error updating last_login:', updateErr);
                }

                console.log('✅ Redirecting to dashboard...');
                router.push('/dashboard');

            } catch (err) {
                console.error('❌ Unexpected callback error:', err);
                setStatus('error');
                setErrorMessage('An unexpected error occurred');
                setTimeout(() => router.push('/auth/login?error=An+unexpected+error+occurred'), 2000);
            }
        };

        handleCallback();
    }, [router, searchParams]);

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full p-6 rounded-lg border border-red-200 bg-red-50">
                    <h2 className="text-xl font-bold text-red-900 mb-4">Authentication Error</h2>
                    <p className="text-red-700 mb-4">{errorMessage}</p>
                    <p className="text-sm text-red-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Completing sign in...</p>
            </div>
        </div>
    );
}
