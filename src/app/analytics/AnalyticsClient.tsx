'use client';

import {
    AnalyticsHeader,
    StatsSummary,
    DeepWorkCard,
    TotalTimeCard,
    MostProductiveHour,
    WeekOverviewChart,
    CategoryBreakdown,
    MostCommonActivity,
    RecentTasks,
} from '@/components/analytics';

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    created_at: string;
}

interface Category {
    id: string;
    name: string;
    color: string;
    type: string;
}

interface AnalyticsClientProps {
    allTasks: Task[];
    todayTasks: Task[];
    yesterdayTasks: Task[];
    weekTasks: Task[];
    categories: Category[];
}

export function AnalyticsClient({
    allTasks,
    todayTasks,
    yesterdayTasks,
    weekTasks,
    categories
}: AnalyticsClientProps) {
    return (
        <main className="pt-28 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <AnalyticsHeader />

                {/* Stats Summary */}
                <StatsSummary
                    todayTasks={todayTasks}
                    yesterdayTasks={yesterdayTasks}
                    categories={categories}
                />

                {/* Deep Work + Total Time + Most Productive Hour */}
                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                    <DeepWorkCard tasks={todayTasks} categories={categories} />
                    <TotalTimeCard tasks={todayTasks} />
                    <MostProductiveHour tasks={allTasks} />
                </div>

                {/* Week Overview Chart */}
                <WeekOverviewChart tasks={weekTasks} categories={categories} />

                {/* Category Breakdown */}
                <CategoryBreakdown tasks={weekTasks} categories={categories} />

                {/* Most Common Activity */}
                <MostCommonActivity tasks={allTasks} categories={categories} />

                {/* Recent Tasks Table */}
                <RecentTasks tasks={allTasks} categories={categories} />
            </div>
        </main>
    );
}
