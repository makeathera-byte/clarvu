import { GoalsClient } from './GoalsClient';
import { getActiveGoals, getGoalHistory } from './actions/goalsActions';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const [activeGoals, historyGoals] = await Promise.all([
        getActiveGoals(),
        getGoalHistory()
    ]);

    return (
        <GoalsClient
            initialGoals={activeGoals}
            initialHistory={historyGoals}
        />
    );
}
