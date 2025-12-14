'use client';

import { useState, useEffect } from 'react';
import { DashboardClient } from './DashboardClient';
import { CategoryStoreInitializer } from '@/components/dashboard/CategoryStoreInitializer';
import { fetchTodayTasks, fetchCategories, fetchUserProfile, fetchTodayCalendarEvents } from './actions';

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'unscheduled';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    priority?: 'low' | 'medium' | 'high';
    is_scheduled?: boolean;
}

interface Category {
    id: string;
    name: string;
    color: string;
    icon?: string;
    type: string;
}

interface CalendarEvent {
    id: string;
    external_id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
}

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [userName, setUserName] = useState<string | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [userTimezone, setUserTimezone] = useState<string>('UTC');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch data client-side for better performance
        async function loadDashboardData() {
            try {
                setIsLoading(true);
                const [tasksData, categoriesData, profileData, eventsData] = await Promise.all([
                    fetchTodayTasks(),
                    fetchCategories(),
                    fetchUserProfile(),
                    fetchTodayCalendarEvents(),
                ]);

                setTasks(tasksData);
                setCategories(categoriesData);
                setUserName(profileData?.full_name || null);
                setUserTimezone(profileData?.timezone || 'UTC');
                setCalendarEvents(eventsData);
            } catch (err) {
                console.error('Error loading dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4 max-w-md p-6">
                    <p className="text-destructive">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <CategoryStoreInitializer categories={categories} />
            <DashboardClient
                initialTasks={tasks}
                userName={userName}
                calendarEvents={calendarEvents}
                userTimezone={userTimezone}
            />
        </>
    );
}
