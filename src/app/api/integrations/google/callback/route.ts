import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/integrations/google/callback`;

    // Handle errors from Google
    if (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(`${appUrl}/settings/integrations?error=oauth_denied`);
    }

    if (!code) {
        return NextResponse.redirect(`${appUrl}/settings/integrations?error=no_code`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${appUrl}/settings/integrations?error=config_missing`);
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            return NextResponse.redirect(`${appUrl}/settings/integrations?error=token_exchange_failed`);
        }

        const tokens = await tokenResponse.json();
        const { access_token, refresh_token, expires_in } = tokens;

        // Calculate token expiry
        const tokenExpiry = new Date(Date.now() + expires_in * 1000).toISOString();

        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(`${appUrl}/auth/login`);
        }

        // Save tokens to Supabase
        const { error: upsertError } = await (supabase as any)
            .from('user_integrations')
            .upsert({
                user_id: user.id,
                provider: 'google_calendar',
                access_token,
                refresh_token,
                token_expiry: tokenExpiry,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,provider',
            });

        if (upsertError) {
            console.error('Failed to save tokens:', upsertError);
            return NextResponse.redirect(`${appUrl}/settings/integrations?error=save_failed`);
        }

        // Success - redirect to integrations page
        return NextResponse.redirect(`${appUrl}/settings/integrations?success=connected`);

    } catch (err) {
        console.error('OAuth callback error:', err);
        return NextResponse.redirect(`${appUrl}/settings/integrations?error=unknown`);
    }
}
