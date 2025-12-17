import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * OAuth Callback Handler (Server Component)
 * 
 * Handles the OAuth callback from Google and exchanges the code for a session.
 * This MUST be a server component to properly set session cookies.
 */
export default async function AuthCallbackPage({
    searchParams,
}: {
    searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
    const params = await searchParams;
    const code = params.code;
    const error = params.error;
    const errorDescription = params.error_description;

    // Handle OAuth errors
    if (error) {
        console.error('OAuth error:', error, errorDescription);
        return redirect(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`);
    }

    // If no code is present, redirect to login
    if (!code) {
        console.error('No code present in OAuth callback');
        return redirect('/auth/login?error=No+authorization+code+received');
    }

    try {
        const supabase = await createClient();

        // Exchange the code for a session - this properly sets cookies
        const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            return redirect(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`);
        }

        if (!session?.user) {
            console.error('No session after code exchange');
            return redirect('/auth/login?error=Failed+to+establish+session');
        }

        const user = session.user;
        console.log('✅ OAuth callback: User authenticated:', user.id);

        // Import and call syncUserProfile directly (we're already server-side)
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
            // Don't fail - user is authenticated, profile likely exists from trigger
        }

        // Update last_login timestamp
        try {
            const { error: updateError } = await (supabase as any)
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating last_login:', updateError);
            }
        } catch (updateErr) {
            console.error('Error updating last_login:', updateErr);
        }

        console.log('✅ Redirecting to dashboard...');

        // Server-side redirect - this will work because cookies are now properly set
        return redirect('/dashboard');

    } catch (err) {
        console.error('❌ Unexpected callback error:', err);
        return redirect('/auth/login?error=An+unexpected+error+occurred');
    }
}

