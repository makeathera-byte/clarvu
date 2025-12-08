'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getAdminStats, getAllUsers, getCalendarIntegrationStatus } from './actions';
import {
    AdminHeader,
    AdminSidebar,
    StatsCards,
    UsersTable,
    UserDrawer,
    CalendarStatus,
    LogsViewer,
    GrowthChart,
    ActiveUsersSection,
    TasksAnalytics,
    AdminTools,
    // Part 3 components
    CountryPieChart,
    DeviceAnalyticsSection,
    SessionDurationHistogram,
    LoginFrequencyChart,
    ActivityHeatmap,
    TaskFunnelChart,
    DeepWorkFunnel,
    ProductivityIndexCard,
    ProductivityHistogram,
    LifecycleDonutChart,
    LifecycleTable,
    CohortWaterfall,
    PowerUsersTable,
    ExportButton,
    AdminQueryRunner,
} from '@/components/admin';

interface AdminStats {
    totalUsers: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    totalTasks: number;
    todayTimers: number;
    calendarConnections: number;
}

interface UserRow {
    id: string;
    full_name: string | null;
    email: string | null;
    created_at: string;
    last_login: string | null;
    is_admin: boolean;
    disabled: boolean;
    task_count: number;
    total_minutes: number;
}

interface CalendarStatusData {
    totalConnected: number;
    expiredTokens: number;
    recentSyncs: number;
}

export function AdminClient() {
    const { currentTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [calendarStatus, setCalendarStatus] = useState<CalendarStatusData | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [statsResult, usersResult, calendarResult] = await Promise.all([
                getAdminStats(),
                getAllUsers(),
                getCalendarIntegrationStatus(),
            ]);

            if (statsResult.stats) setStats(statsResult.stats);
            if (usersResult.users) setUsers(usersResult.users);
            if (calendarResult.status) setCalendarStatus(calendarResult.status);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'growth':
                return (
                    <motion.div key="growth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <GrowthChart />
                    </motion.div>
                );
            case 'active-users':
                return (
                    <motion.div key="active-users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <ActiveUsersSection />
                    </motion.div>
                );
            case 'tasks':
                return (
                    <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <TasksAnalytics />
                    </motion.div>
                );
            case 'geography':
                return (
                    <motion.div key="geography" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <CountryPieChart />
                    </motion.div>
                );
            case 'devices':
                return (
                    <motion.div key="devices" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <DeviceAnalyticsSection />
                    </motion.div>
                );
            case 'activity':
                return (
                    <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <ActivityHeatmap />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SessionDurationHistogram />
                            <LoginFrequencyChart />
                        </div>
                    </motion.div>
                );
            case 'funnels':
                return (
                    <motion.div key="funnels" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TaskFunnelChart />
                        <DeepWorkFunnel />
                    </motion.div>
                );
            case 'productivity':
                return (
                    <motion.div key="productivity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ProductivityIndexCard />
                            <ProductivityHistogram />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <LifecycleDonutChart />
                            <LifecycleTable />
                        </div>
                    </motion.div>
                );
            case 'cohorts':
                return (
                    <motion.div key="cohorts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <CohortWaterfall />
                    </motion.div>
                );
            case 'power-users':
                return (
                    <motion.div key="power-users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <PowerUsersTable />
                    </motion.div>
                );
            case 'users':
                return (
                    <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <UsersTable users={users} onSelectUser={(id) => setSelectedUserId(id)} />
                    </motion.div>
                );
            case 'calendar':
                return (
                    <motion.div key="calendar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        {calendarStatus && <CalendarStatus status={calendarStatus} />}
                    </motion.div>
                );
            case 'logs':
                return (
                    <motion.div key="logs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <LogsViewer />
                    </motion.div>
                );
            case 'tools':
                return (
                    <motion.div key="tools" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <AdminTools onRefresh={loadData} />
                    </motion.div>
                );
            case 'exports':
                return (
                    <motion.div key="exports" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-start justify-center pt-20">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>
                                Export Data
                            </h3>
                            <ExportButton />
                        </div>
                    </motion.div>
                );
            case 'sql':
                return (
                    <motion.div key="sql" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <AdminQueryRunner />
                    </motion.div>
                );
            default:
                return (
                    <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        {stats && <StatsCards stats={stats} />}
                        <GrowthChart />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TaskFunnelChart />
                            <DeepWorkFunnel />
                        </div>
                        <div
                            className="p-4 rounded-3xl border"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                borderColor: currentTheme.colors.border,
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>
                                    Recent Users
                                </h3>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className="text-sm font-medium hover:underline"
                                    style={{ color: currentTheme.colors.primary }}
                                >
                                    View All →
                                </button>
                            </div>
                            <UsersTable users={users.slice(0, 5)} onSelectUser={(id) => setSelectedUserId(id)} />
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="lg:pl-64 pt-4 lg:pt-0">
                <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 pt-24 lg:pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <AdminHeader />
                        <ExportButton />
                    </div>

                    {isLoading ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-32 rounded-3xl skeleton" />
                                ))}
                            </div>
                            <div className="h-80 rounded-3xl skeleton" />
                            <div className="h-96 rounded-3xl skeleton" />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
                    )}
                </div>
            </div>

            <UserDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
        </div>
    );
}
