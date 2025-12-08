import { fetchTodayTasks, fetchCategories, fetchUserProfile, fetchTodayCalendarEvents } from './actions';
import { DashboardClient } from './DashboardClient';
import { CategoryStoreInitializer } from '@/components/dashboard/CategoryStoreInitializer';

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    try {
        // Fetch all data on the server
        const [tasks, categories, profile, calendarEvents] = await Promise.all([
            fetchTodayTasks(),
            fetchCategories(),
            fetchUserProfile(),
            fetchTodayCalendarEvents(),
        ]);

        return (
            <>
                {/* Initialize category store with server data */}
                <CategoryStoreInitializer categories={categories} />
                <DashboardClient
                    initialTasks={tasks}
                    userName={profile?.full_name}
                    calendarEvents={calendarEvents}
                />
            </>
        );
    } catch (error) {
        console.error('Error in DashboardPage:', error);
        // Return empty state instead of crashing
        return (
            <>
                <CategoryStoreInitializer categories={[]} />
                <DashboardClient
                    initialTasks={[]}
                    userName={null}
                    calendarEvents={[]}
                />
            </>
        );
    }
}
