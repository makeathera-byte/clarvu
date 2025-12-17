import { Suspense } from 'react';
import { DashboardClient } from './DashboardClient';
import { CategoryStoreInitializer } from '@/components/dashboard/CategoryStoreInitializer';
import { fetchTodayTasks, fetchCategories, fetchUserProfile, fetchTodayCalendarEvents } from './actions';
import { redirect } from 'next/navigation';

function DashboardSkeleton() {
    return (
        <div className="pt-28 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="h-12 bg-muted rounded-lg mb-6 w-64"></div>

                    {/* Grid skeleton */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        <div className="h-96 bg-muted rounded-2xl"></div>
                        <div className="h-96 bg-muted rounded-2xl"></div>
                    </div>

                    {/* Bottom cards skeleton */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="h-64 bg-muted rounded-2xl"></div>
                        <div className="h-64 bg-muted rounded-2xl"></div>
                        <div className="h-64 bg-muted rounded-2xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default async function DashboardPage() {
    // Fetch all data in parallel on the server for optimal performance
    const [tasksData, categoriesData, profileData, eventsData] = await Promise.all([
        fetchTodayTasks(),
        fetchCategories(),
        fetchUserProfile(),
        fetchTodayCalendarEvents(),
    ]);

    // Check if user has completed onboarding
    if (profileData && !profileData.onboarding_complete) {
        redirect('/auth/onboarding');
    }

    return (
        <>
            <CategoryStoreInitializer categories={categoriesData} />
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardClient
                    initialTasks={tasksData}
                    userName={profileData?.full_name || null}
                    calendarEvents={eventsData}
                    userTimezone={profileData?.timezone || 'UTC'}
                />
            </Suspense>
        </>
    );
}
