/**
 * Trial Status API Endpoint
 * 
 * Returns trial days remaining for the authenticated user
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTrialDaysRemaining, isTrialActive } from '@/lib/trial/utils';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const daysRemaining = await getTrialDaysRemaining(user.id);
        const isActive = await isTrialActive(user.id);

        return NextResponse.json({
            daysRemaining,
            isActive,
        });
    } catch (error) {
        console.error('Trial status error:', error);
        return NextResponse.json(
            { error: 'Failed to get trial status' },
            { status: 500 }
        );
    }
}
