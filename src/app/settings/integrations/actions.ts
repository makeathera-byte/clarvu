'use server';

import { createClient } from '@/lib/supabase/server';
import { syncGoogleEvents, getGoogleCalendarConnection } from '@/lib/googleCalendar/syncEvents';
import { revalidatePath } from 'next/cache';

export async function syncGoogleCalendarAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const result = await syncGoogleEvents(user.id);

    if (result.success) {
        revalidatePath('/dashboard');
        revalidatePath('/settings/integrations');
    }

    return result;
}

export async function getConnectionStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { connected: false };
    }

    return getGoogleCalendarConnection(user.id);
}

export async function disconnectGoogleCalendar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Delete the integration
    const { error } = await (supabase as any)
        .from('user_integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', 'google_calendar');

    if (error) {
        return { success: false, error: 'Failed to disconnect' };
    }

    // Optionally delete synced events
    await (supabase as any)
        .from('calendar_events')
        .delete()
        .eq('user_id', user.id);

    revalidatePath('/settings/integrations');
    revalidatePath('/dashboard');

    return { success: true };
}
