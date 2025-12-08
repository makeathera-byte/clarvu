import { createClient } from '@/lib/supabase/server';
import { getGoogleCalendarConnection } from '@/lib/googleCalendar/syncEvents';
import { IntegrationsClient } from './IntegrationsClient';
import { redirect } from 'next/navigation';

interface SearchParams {
    success?: string;
    error?: string;
}

export default async function IntegrationsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect('/auth/login');
        }

        // Get connection status
        const connectionStatus = await getGoogleCalendarConnection(user.id);

    // Parse URL params for messages
    const params = await searchParams;
    let successMessage: string | null = null;
    let errorMessage: string | null = null;

    if (params.success === 'connected') {
        successMessage = 'Google Calendar connected successfully!';
    }

    if (params.error) {
        switch (params.error) {
            case 'oauth_denied':
                errorMessage = 'Google Calendar authorization was denied.';
                break;
            case 'no_code':
                errorMessage = 'No authorization code received from Google.';
                break;
            case 'config_missing':
                errorMessage = 'Google OAuth is not configured properly.';
                break;
            case 'token_exchange_failed':
                errorMessage = 'Failed to exchange authorization code for tokens.';
                break;
            case 'save_failed':
                errorMessage = 'Failed to save integration to database.';
                break;
            default:
                errorMessage = 'An unknown error occurred.';
        }
    }

        return (
            <IntegrationsClient
                isConnected={connectionStatus.connected}
                lastSynced={connectionStatus.lastSynced}
                successMessage={successMessage}
                errorMessage={errorMessage}
            />
        );
    } catch (error) {
        console.error('Error in IntegrationsPage:', error);
        // Return error state instead of crashing
        return (
            <IntegrationsClient
                isConnected={false}
                lastSynced={null}
                successMessage={null}
                errorMessage="Failed to load integration settings. Please try again."
            />
        );
    }
}
