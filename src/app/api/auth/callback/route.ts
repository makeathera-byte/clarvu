import { createClient } from '@/lib/supabase/server';
import { syncUserProfile } from '@/lib/auth/profileSync';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (code) {
        try {
            const supabase = await createClient();

            // Exchange code for session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error('OAuth callback error:', error);
                return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
            }

            if (data.user) {
                // Sync user profile (handles Google OAuth metadata)
                await syncUserProfile(data.user);

                // Check if user has completed onboarding
                const { data: profile, error: profileError } = await (supabase as any)
                    .from('profiles')
                    .select('onboarding_complete')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                    // Redirect to dashboard as fallback
                    return NextResponse.redirect(`${origin}/dashboard`);
                }

                // Redirect based on onboarding status
                if (profile?.onboarding_complete) {
                    return NextResponse.redirect(`${origin}/dashboard`);
                } else {
                    return NextResponse.redirect(`${origin}/auth/onboarding`);
                }
            }
        } catch (error) {
            console.error('OAuth callback exception:', error);
            return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
        }
    }

    // No code provided
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
}
