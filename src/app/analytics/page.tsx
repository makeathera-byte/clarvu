import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
    fetchAnalyticsTasks,
    fetchAllCategories,
    fetchTodayTasksForAnalytics,
    fetchYesterdayTasks,
} from './actions';
import { AnalyticsClient } from './AnalyticsClient';

export default async function AnalyticsPage() {
    const supabase = await createClient();

    // Check authentication - redirect if not logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Fetch all data for authenticated user
    const [allTasks, todayTasks, yesterdayTasks, categories] = await Promise.all([
        fetchAnalyticsTasks(30), // Last 30 days
        fetchTodayTasksForAnalytics(),
        fetchYesterdayTasks(),
        fetchAllCategories(),
    ]);

    // Filter week tasks (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weekTasks = allTasks.filter(t =>
        t.start_time && new Date(t.start_time) >= weekAgo
    );

    return (
        <AnalyticsClient
            allTasks={allTasks}
            todayTasks={todayTasks}
            yesterdayTasks={yesterdayTasks}
            weekTasks={weekTasks}
            categories={categories}
        />
    );
}
