import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DeepWorkClient } from './DeepWorkClient';
import {
    getDeepWorkSessions,
    getSessionQuality,
    getConsistencyIndex,
    getCategoryEffectiveness,
    getWeeklyTrend,
    getDeepWorkInsights,
} from './actions';

export default async function DeepWorkPage() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect('/auth/login');
        }

        // Fetch all data in parallel
        const [sessions, quality, consistency, categories, weekly, insights] = await Promise.all([
            getDeepWorkSessions('7d'),
            getSessionQuality(),
            getConsistencyIndex(),
            getCategoryEffectiveness(),
            getWeeklyTrend(),
            getDeepWorkInsights(),
        ]);

        return (
            <DeepWorkClient
                sessions={'error' in sessions ? null : sessions}
                quality={'error' in quality ? null : quality}
                consistency={'error' in consistency ? null : consistency}
                categories={'error' in categories ? null : categories}
                weekly={'error' in weekly ? null : weekly}
                insights={'error' in insights ? null : insights}
            />
        );
    } catch (error) {
        console.error('Error in DeepWorkPage:', error);
        // Return empty state instead of crashing
        return (
            <DeepWorkClient
                sessions={null}
                quality={null}
                consistency={null}
                categories={null}
                weekly={null}
                insights={null}
            />
        );
    }
}
