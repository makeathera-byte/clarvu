import { createClient } from '@/lib/supabase/server';

interface GoogleEvent {
    id: string;
    summary?: string;
    description?: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
}

interface CalendarEvent {
    external_id: string;
    user_id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    source: string;
}

export async function refreshAccessToken(
    userId: string,
    refreshToken: string
): Promise<string | null> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('Google credentials not configured');
        return null;
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            console.error('Failed to refresh token:', await response.text());
            return null;
        }

        const data = await response.json();
        const { access_token, expires_in } = data;

        // Update token in Supabase
        const supabase = await createClient();
        const tokenExpiry = new Date(Date.now() + expires_in * 1000).toISOString();

        await (supabase as any)
            .from('user_integrations')
            .update({
                access_token,
                token_expiry: tokenExpiry,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('provider', 'google_calendar');

        return access_token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
}

export async function syncGoogleEvents(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Fetch integration tokens
    const { data: integration, error: integrationError } = await (supabase as any)
        .from('user_integrations')
        .select('access_token, refresh_token, token_expiry')
        .eq('user_id', userId)
        .eq('provider', 'google_calendar')
        .single();

    if (integrationError || !integration) {
        return { success: false, error: 'Google Calendar not connected' };
    }

    let { access_token, refresh_token, token_expiry } = integration;

    // Check if token is expired
    const isExpired = new Date(token_expiry) <= new Date();
    if (isExpired && refresh_token) {
        const newToken = await refreshAccessToken(userId, refresh_token);
        if (!newToken) {
            return { success: false, error: 'Failed to refresh token' };
        }
        access_token = newToken;
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
        // Fetch events from Google Calendar API
        const params = new URLSearchParams({
            timeMin: today.toISOString(),
            timeMax: tomorrow.toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
        });

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Calendar API error:', errorText);
            return { success: false, error: 'Failed to fetch events from Google' };
        }

        const data = await response.json();
        const events: GoogleEvent[] = data.items || [];

        // Normalize and upsert events
        const calendarEvents: CalendarEvent[] = events.map((event) => ({
            external_id: event.id,
            user_id: userId,
            title: event.summary || 'Untitled Event',
            description: event.description || null,
            start_time: event.start.dateTime || event.start.date || '',
            end_time: event.end.dateTime || event.end.date || '',
            source: 'google',
        }));

        // Upsert events to Supabase
        for (const calEvent of calendarEvents) {
            await (supabase as any)
                .from('calendar_events')
                .upsert(calEvent, {
                    onConflict: 'external_id,user_id',
                });
        }

        return { success: true };
    } catch (error) {
        console.error('Error syncing events:', error);
        return { success: false, error: 'Unknown error occurred' };
    }
}

export async function getGoogleCalendarConnection(userId: string): Promise<{
    connected: boolean;
    lastSynced?: string;
}> {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
        .from('user_integrations')
        .select('updated_at')
        .eq('user_id', userId)
        .eq('provider', 'google_calendar')
        .single();

    if (error || !data) {
        return { connected: false };
    }

    return {
        connected: true,
        lastSynced: data.updated_at,
    };
}

export async function fetchTodayCalendarEvents(userId: string) {
    const supabase = await createClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await (supabase as any)
        .from('calendar_events')
        .select('id, external_id, title, description, start_time, end_time')
        .eq('user_id', userId)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }

    return data || [];
}
