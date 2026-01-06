import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { fetchCalendarTasks } from './actions/fetchCalendarTasks';
import { CalendarClient } from './CalendarClient';

export default async function CalendarPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Fetch initial data - default to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const tasksResult = await fetchCalendarTasks(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
    );
    const initialTasks = tasksResult.tasks || [];

    // Fetch initial goals
    const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <CalendarClient
            initialTasks={initialTasks}
            initialEvents={[]}
            initialGoals={goals || []}
            userId={user.id}
        />
    );
}
