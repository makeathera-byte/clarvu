'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';
import { syncUserProfile } from '@/lib/auth/profileSync';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the session from URL hash/query params
                const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setError(sessionError.message);
                    setTimeout(() => router.push('/auth/login'), 2000);
                    return;
                }

                if (session?.user) {
                    console.log('OAuth callback: User authenticated:', session.user.id);

                    // Sync profile to ensure it has correct OAuth data
                    // Don't fail the entire login if sync has issues
                    try {
                        const syncResult = await syncUserProfile(session.user);
                        if (!syncResult.success) {
                            console.warn('Profile sync had issues, but continuing:', syncResult.error);
                        } else {
                            console.log('Profile sync successful');
                        }
                    } catch (syncErr) {
                        console.error('Profile sync error, but continuing:', syncErr);
                        // Don't fail - user is authenticated, profile likely exists from trigger
                    }

                    // Update last_login timestamp
                    try {
                        const { error: updateError } = await (supabaseClient as any)
                            .from('profiles')
                            .update({ last_login: new Date().toISOString() })
                            .eq('id', session.user.id);

                        if (updateError) {
                            console.error('Error updating last_login:', updateError);
                        }
                    } catch (updateErr) {
                        console.error('Error updating last_login:', updateErr);
                    }

                    console.log('Redirecting to dashboard...');
                    router.push('/dashboard');
                } else {
                    // No session found, redirect to login
                    setError('Authentication failed. Please try again.');
                    setTimeout(() => router.push('/auth/login'), 2000);
                }
            } catch (err) {
                console.error('Callback error:', err);
                setError('An unexpected error occurred');
                setTimeout(() => router.push('/auth/login'), 2000);
            }
        };

        handleCallback();
    }, [router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full p-6 rounded-lg border border-red-200 bg-red-50">
                    <h2 className="text-xl font-bold text-red-900 mb-4">Authentication Error</h2>
                    <p className="text-red-700 mb-4">{error}</p>
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

