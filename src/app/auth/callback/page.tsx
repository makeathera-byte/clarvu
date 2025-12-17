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

                // The Supabase client automatically processes the OAuth callback from the URL
                // when the page loads. We need to wait for the session to be established.
                // Try multiple times with increasing delays to handle timing issues
                let session = null;
                let sessionError = null;
                let attempts = 0;
                const maxAttempts = 5;

                while (attempts < maxAttempts && !session) {
                    await new Promise(resolve => setTimeout(resolve, 500 * (attempts + 1)));
                    const result = await supabaseClient.auth.getSession();
                    session = result.data?.session;
                    sessionError = result.error;
                    attempts++;

                    if (session) {
                        console.log(`✅ Session established after ${attempts} attempt(s)`);
                        break;
                    }
                }

                if (sessionError) {
                    console.error('❌ Session error:', sessionError);
                    setStatus('error');
                    setErrorMessage(sessionError.message);
                    setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(sessionError.message)}`), 2000);
                    return;
                }

                if (!session?.user) {
                    console.error('❌ No session found after OAuth callback after', maxAttempts, 'attempts');
                    setStatus('error');
                    setErrorMessage('Failed to establish session. Please try again.');
                    setTimeout(() => router.push('/auth/login?error=No+session+established'), 2000);
                    return;
                }

                const user = session.user;
                console.log('✅ OAuth callback: User authenticated:', user.id);

                // Call server action to sync profile
                let syncResult: { success: boolean; error?: string } | null = null;
                try {
                    const { syncUserProfile } = await import('@/lib/auth/profileSync');
                    syncResult = await syncUserProfile(user);

                    if (!syncResult.success) {
                        console.warn('⚠️ Profile sync had issues, but continuing:', syncResult.error);
                    } else {
                        console.log('✅ Profile sync successful');
                    }
                } catch (syncErr) {
                    console.error('❌ Profile sync error, but continuing:', syncErr);
                    syncResult = { success: false, error: syncErr instanceof Error ? syncErr.message : 'Unknown error' };
                }

                // Update last_login timestamp (only if profile exists)
                // The trigger should have created the profile, but wait a bit if needed
                try {
                    // Wait a bit more for trigger to complete if profile sync had issues
                    if (syncResult && !syncResult.success) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    
                    const { error: updateErr } = await (supabaseClient as any)
                        .from('profiles')
                        .update({ last_login: new Date().toISOString() })
                        .eq('id', user.id);
                    
                    if (updateErr) {
                        console.warn('Could not update last_login (profile may not exist yet):', updateErr);
                    }
                } catch (updateErr) {
                    console.warn('Error updating last_login:', updateErr);
                    // Don't fail the entire flow if this fails
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
