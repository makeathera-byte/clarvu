'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================
// TYPES
// ============================================

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

interface UserDetails {
    id: string;
    full_name: string | null;
    email: string | null;
    created_at: string;
    last_login: string | null;
    is_admin: boolean;
    disabled: boolean;
    taskSummary: {
        total: number;
        completed: number;
        inProgress: number;
        scheduled: number;
    };
    calendarConnected: boolean;
    recentTasks: Array<{
        id: string;
        title: string;
        status: string;
        created_at: string;
    }>;
}

interface SystemLog {
    id: number;
    log_type: string;
    message: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

interface GrowthData {
    date: string;
    signups: number;
}

interface ActiveUsersData {
    date: string;
    dau: number;
    wau: number;
}

interface TasksTrendData {
    date: string;
    tasks: number;
    completed: number;
}

interface CategoryData {
    name: string;
    count: number;
    color: string;
}

interface CalendarStatus {
    totalConnected: number;
    expiredTokens: number;
    recentSyncs: number;
}

// ============================================
// ADMIN VERIFICATION HELPER
// ============================================

async function verifyAdmin(): Promise<{ userId: string } | { error: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        return { error: 'Not authorized' };
    }

    return { userId: user.id };
}

// ============================================
// BASIC STATS
// ============================================

export async function getAdminStats(): Promise<{ stats?: AdminStats; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    try {
        const { count: totalUsers } = await (supabase as any)
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        const { count: dailyActiveUsers } = await (supabase as any)
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('last_login', oneDayAgo.toISOString());

        const { count: weeklyActiveUsers } = await (supabase as any)
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('last_login', oneWeekAgo.toISOString());

        const { count: totalTasks } = await (supabase as any)
            .from('tasks')
            .select('*', { count: 'exact', head: true });

        const { count: todayTimers } = await (supabase as any)
            .from('active_timers')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart.toISOString());

        const { count: calendarConnections } = await (supabase as any)
            .from('user_integrations')
            .select('*', { count: 'exact', head: true })
            .eq('provider', 'google_calendar');

        return {
            stats: {
                totalUsers: totalUsers || 0,
                dailyActiveUsers: dailyActiveUsers || 0,
                weeklyActiveUsers: weeklyActiveUsers || 0,
                totalTasks: totalTasks || 0,
                todayTimers: todayTimers || 0,
                calendarConnections: calendarConnections || 0,
            },
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return { error: 'Failed to fetch statistics' };
    }
}

// ============================================
// USER GROWTH DATA
// ============================================

export async function getUserGrowth(days: number = 14): Promise<{ data?: GrowthData[]; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    try {
        const { data: profiles } = await (supabase as any)
            .from('profiles')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true });

        // Group by date
        const growthMap = new Map<string, number>();

        // Initialize all dates
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            growthMap.set(dateStr, 0);
        }

        // Count signups per day
        (profiles || []).forEach((p: { created_at: string }) => {
            const dateStr = new Date(p.created_at).toISOString().split('T')[0];
            growthMap.set(dateStr, (growthMap.get(dateStr) || 0) + 1);
        });

        const data = Array.from(growthMap.entries()).map(([date, signups]) => ({
            date,
            signups,
        }));

        return { data };
    } catch (error) {
        console.error('Error fetching user growth:', error);
        return { error: 'Failed to fetch growth data' };
    }
}

// ============================================
// ACTIVE USERS DATA
// ============================================

export async function getActiveUsersData(days: number = 14): Promise<{ data?: ActiveUsersData[]; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    try {
        const { data: profiles } = await (supabase as any)
            .from('profiles')
            .select('last_login, created_at')
            .gte('created_at', new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const data: ActiveUsersData[] = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
            const weekStart = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);

            let dau = 0;
            let wau = 0;

            (profiles || []).forEach((p: { last_login: string | null }) => {
                if (!p.last_login) return;
                const loginDate = new Date(p.last_login);
                if (loginDate >= date && loginDate < dayEnd) dau++;
                if (loginDate >= weekStart && loginDate < dayEnd) wau++;
            });

            data.push({ date: dateStr, dau, wau });
        }

        return { data };
    } catch (error) {
        console.error('Error fetching active users:', error);
        return { error: 'Failed to fetch active users data' };
    }
}

// ============================================
// TASKS TREND DATA
// ============================================

export async function getTasksTrend(days: number = 14): Promise<{ data?: TasksTrendData[]; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    try {
        const { data: tasks } = await (supabase as any)
            .from('tasks')
            .select('created_at, status')
            .gte('created_at', startDate.toISOString());

        const trendMap = new Map<string, { tasks: number; completed: number }>();

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            trendMap.set(dateStr, { tasks: 0, completed: 0 });
        }

        (tasks || []).forEach((t: { created_at: string; status: string }) => {
            const dateStr = new Date(t.created_at).toISOString().split('T')[0];
            const entry = trendMap.get(dateStr);
            if (entry) {
                entry.tasks++;
                if (t.status === 'completed') entry.completed++;
            }
        });

        const data = Array.from(trendMap.entries()).map(([date, counts]) => ({
            date,
            ...counts,
        }));

        return { data };
    } catch (error) {
        console.error('Error fetching tasks trend:', error);
        return { error: 'Failed to fetch tasks trend' };
    }
}

// ============================================
// CATEGORY DISTRIBUTION
// ============================================

export async function getCategoryDistribution(): Promise<{ data?: CategoryData[]; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { data: categories } = await (supabase as any)
            .from('categories')
            .select('id, name, color');

        const { data: tasks } = await (supabase as any)
            .from('tasks')
            .select('category_id');

        const countMap = new Map<string, { name: string; color: string; count: number }>();

        (categories || []).forEach((c: { id: string; name: string; color: string }) => {
            countMap.set(c.id, { name: c.name, color: c.color, count: 0 });
        });

        (tasks || []).forEach((t: { category_id: string | null }) => {
            if (t.category_id && countMap.has(t.category_id)) {
                const entry = countMap.get(t.category_id)!;
                entry.count++;
            }
        });

        const data = Array.from(countMap.values()).filter(c => c.count > 0);

        return { data };
    } catch (error) {
        console.error('Error fetching category distribution:', error);
        return { error: 'Failed to fetch category distribution' };
    }
}

// ============================================
// ALL USERS
// ============================================

export async function getAllUsers(): Promise<{ users?: UserRow[]; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { data: profiles, error } = await (supabase as any)
            .from('profiles')
            .select('id, full_name, created_at, last_login, is_admin, disabled')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const users: UserRow[] = await Promise.all(
            (profiles || []).map(async (profile: any) => {
                const { count: taskCount } = await (supabase as any)
                    .from('tasks')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', profile.id);

                const { data: tasks } = await (supabase as any)
                    .from('tasks')
                    .select('duration_minutes')
                    .eq('user_id', profile.id)
                    .not('duration_minutes', 'is', null);

                const totalMinutes = (tasks || []).reduce(
                    (sum: number, t: { duration_minutes: number }) => sum + (t.duration_minutes || 0),
                    0
                );

                return {
                    id: profile.id,
                    full_name: profile.full_name,
                    email: profile.full_name ? `${profile.full_name.toLowerCase().replace(/\s+/g, '.')}@user` : null,
                    created_at: profile.created_at,
                    last_login: profile.last_login,
                    is_admin: profile.is_admin || false,
                    disabled: profile.disabled || false,
                    task_count: taskCount || 0,
                    total_minutes: totalMinutes,
                };
            })
        );

        return { users };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { error: 'Failed to fetch users' };
    }
}

// ============================================
// USER DETAILS
// ============================================

export async function getUserDetails(userId: string): Promise<{ user?: UserDetails; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { data: profile, error } = await (supabase as any)
            .from('profiles')
            .select('id, full_name, created_at, last_login, is_admin, disabled')
            .eq('id', userId)
            .single();

        if (error) throw error;

        const { data: tasks } = await (supabase as any)
            .from('tasks')
            .select('id, title, status, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        const { count: totalTasks } = await (supabase as any)
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        const { count: completedTasks } = await (supabase as any)
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed');

        const { count: inProgressTasks } = await (supabase as any)
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'in_progress');

        const { count: scheduledTasks } = await (supabase as any)
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'scheduled');

        const { data: integration } = await (supabase as any)
            .from('user_integrations')
            .select('id')
            .eq('user_id', userId)
            .eq('provider', 'google_calendar')
            .single();

        return {
            user: {
                id: profile.id,
                full_name: profile.full_name,
                email: profile.full_name ? `${profile.full_name.toLowerCase().replace(/\s+/g, '.')}@user` : null,
                created_at: profile.created_at,
                last_login: profile.last_login,
                is_admin: profile.is_admin || false,
                disabled: profile.disabled || false,
                taskSummary: {
                    total: totalTasks || 0,
                    completed: completedTasks || 0,
                    inProgress: inProgressTasks || 0,
                    scheduled: scheduledTasks || 0,
                },
                calendarConnected: !!integration,
                recentTasks: tasks || [],
            },
        };
    } catch (error) {
        console.error('Error fetching user details:', error);
        return { error: 'Failed to fetch user details' };
    }
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function revokeUser(userId: string): Promise<{ success?: boolean; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { error } = await (supabase as any)
            .from('profiles')
            .update({ disabled: true })
            .eq('id', userId);

        if (error) throw error;

        revalidatePath('/ppadminpp');
        return { success: true };
    } catch (error) {
        console.error('Error revoking user:', error);
        return { error: 'Failed to revoke user' };
    }
}

export async function restoreUser(userId: string): Promise<{ success?: boolean; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { error } = await (supabase as any)
            .from('profiles')
            .update({ disabled: false })
            .eq('id', userId);

        if (error) throw error;

        revalidatePath('/ppadminpp');
        return { success: true };
    } catch (error) {
        console.error('Error restoring user:', error);
        return { error: 'Failed to restore user' };
    }
}

// ============================================
// SYSTEM LOGS
// ============================================

export async function getSystemLogs(): Promise<{ logs?: SystemLog[]; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { data: logs, error } = await (supabase as any)
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) throw error;

        return { logs: logs || [] };
    } catch (error) {
        console.error('Error fetching system logs:', error);
        return { error: 'Failed to fetch logs' };
    }
}

// ============================================
// CALENDAR STATUS
// ============================================

export async function getCalendarIntegrationStatus(): Promise<{ status?: CalendarStatus; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
        const { count: totalConnected } = await (supabase as any)
            .from('user_integrations')
            .select('*', { count: 'exact', head: true })
            .eq('provider', 'google_calendar');

        const { count: expiredTokens } = await (supabase as any)
            .from('user_integrations')
            .select('*', { count: 'exact', head: true })
            .eq('provider', 'google_calendar')
            .lt('token_expiry', now.toISOString());

        const { count: recentSyncs } = await (supabase as any)
            .from('user_integrations')
            .select('*', { count: 'exact', head: true })
            .eq('provider', 'google_calendar')
            .gte('updated_at', oneDayAgo.toISOString());

        return {
            status: {
                totalConnected: totalConnected || 0,
                expiredTokens: expiredTokens || 0,
                recentSyncs: recentSyncs || 0,
            },
        };
    } catch (error) {
        console.error('Error fetching calendar status:', error);
        return { error: 'Failed to fetch calendar status' };
    }
}

// ============================================
// CHECK ADMIN
// ============================================

export async function checkIsAdmin(): Promise<boolean> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    return profile?.is_admin === true;
}

// ============================================
// ADVANCED ANALYTICS - PART 3
// ============================================

// Country Analytics (mock data since country field may not exist)
export async function getCountryAnalytics(): Promise<{ data?: Array<{ country: string; count: number; percentage: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    // Mock data - in production, query profiles.country
    const mockData = [
        { country: 'United States', count: 45, percentage: 35 },
        { country: 'India', count: 30, percentage: 23 },
        { country: 'United Kingdom', count: 18, percentage: 14 },
        { country: 'Germany', count: 12, percentage: 9 },
        { country: 'Canada', count: 10, percentage: 8 },
        { country: 'Australia', count: 8, percentage: 6 },
        { country: 'Other', count: 7, percentage: 5 },
    ];

    return { data: mockData };
}

// Device Analytics (mock data)
export async function getDeviceAnalytics(): Promise<{ data?: Array<{ device: string; count: number; percentage: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const mockData = [
        { device: 'Desktop', count: 85, percentage: 65 },
        { device: 'Mobile', count: 35, percentage: 27 },
        { device: 'Tablet', count: 10, percentage: 8 },
    ];

    return { data: mockData };
}

// Browser Analytics (mock data)
export async function getBrowserAnalytics(): Promise<{ data?: Array<{ browser: string; count: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const mockData = [
        { browser: 'Chrome', count: 72 },
        { browser: 'Safari', count: 28 },
        { browser: 'Firefox', count: 15 },
        { browser: 'Edge', count: 10 },
        { browser: 'Other', count: 5 },
    ];

    return { data: mockData };
}

// OS Analytics (mock data)
export async function getOSAnalytics(): Promise<{ data?: Array<{ os: string; count: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const mockData = [
        { os: 'Windows', count: 55 },
        { os: 'macOS', count: 35 },
        { os: 'iOS', count: 20 },
        { os: 'Android', count: 15 },
        { os: 'Linux', count: 5 },
    ];

    return { data: mockData };
}

// Session Duration Distribution
export async function getSessionDurationDistribution(): Promise<{ data?: Array<{ bucket: string; count: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { data: tasks } = await (supabase as any)
            .from('tasks')
            .select('duration_minutes')
            .not('duration_minutes', 'is', null);

        const buckets = {
            '0-1 min': 0,
            '1-5 min': 0,
            '5-15 min': 0,
            '15-30 min': 0,
            '30-60 min': 0,
            '1hr+': 0,
        };

        (tasks || []).forEach((t: { duration_minutes: number }) => {
            const mins = t.duration_minutes;
            if (mins <= 1) buckets['0-1 min']++;
            else if (mins <= 5) buckets['1-5 min']++;
            else if (mins <= 15) buckets['5-15 min']++;
            else if (mins <= 30) buckets['15-30 min']++;
            else if (mins <= 60) buckets['30-60 min']++;
            else buckets['1hr+']++;
        });

        const data = Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
        return { data };
    } catch (error) {
        console.error('Error fetching session distribution:', error);
        return { error: 'Failed to fetch session distribution' };
    }
}

// Login Frequency Buckets
export async function getLoginFrequencyBuckets(): Promise<{ data?: Array<{ bucket: string; count: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    // Mock data - would need login tracking table
    const mockData = [
        { bucket: '1 login', count: 25 },
        { bucket: '2-5 logins', count: 40 },
        { bucket: '5-10 logins', count: 30 },
        { bucket: '10-20 logins', count: 20 },
        { bucket: '20+ logins', count: 15 },
    ];

    return { data: mockData };
}

// Activity Heatmap (Week x Hour)
export async function getActivityHeatmap(): Promise<{ data?: Array<{ day: number; hour: number; value: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { data: tasks } = await (supabase as any)
            .from('tasks')
            .select('created_at, status')
            .eq('status', 'completed');

        const heatmap: Record<string, number> = {};

        // Initialize all cells
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                heatmap[`${day}-${hour}`] = 0;
            }
        }

        (tasks || []).forEach((t: { created_at: string }) => {
            const date = new Date(t.created_at);
            const day = date.getDay();
            const hour = date.getHours();
            heatmap[`${day}-${hour}`]++;
        });

        const data = Object.entries(heatmap).map(([key, value]) => {
            const [day, hour] = key.split('-').map(Number);
            return { day, hour, value };
        });

        return { data };
    } catch (error) {
        console.error('Error fetching activity heatmap:', error);
        return { error: 'Failed to fetch heatmap' };
    }
}

// Task Completion Funnel
export async function getTaskFunnel(): Promise<{ data?: Array<{ stage: string; count: number; percentage: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { count: created } = await (supabase as any)
            .from('tasks')
            .select('*', { count: 'exact', head: true });

        const { count: started } = await (supabase as any)
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .in('status', ['in_progress', 'completed']);

        const { count: longProgress } = await (supabase as any)
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .gte('duration_minutes', 10);

        const { count: completed } = await (supabase as any)
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');

        const total = created || 1;
        const data = [
            { stage: 'Created', count: created || 0, percentage: 100 },
            { stage: 'Started', count: started || 0, percentage: Math.round(((started || 0) / total) * 100) },
            { stage: '>10 min', count: longProgress || 0, percentage: Math.round(((longProgress || 0) / total) * 100) },
            { stage: 'Completed', count: completed || 0, percentage: Math.round(((completed || 0) / total) * 100) },
        ];

        return { data };
    } catch (error) {
        console.error('Error fetching task funnel:', error);
        return { error: 'Failed to fetch funnel' };
    }
}

// Deep Work Funnel
export async function getDeepWorkFunnel(): Promise<{ data?: Array<{ stage: string; count: number; percentage: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { data: tasks } = await (supabase as any)
            .from('tasks')
            .select('duration_minutes')
            .not('duration_minutes', 'is', null);

        let started = 0, reached10 = 0, reached20 = 0, reached30 = 0;

        (tasks || []).forEach((t: { duration_minutes: number }) => {
            if (t.duration_minutes > 0) started++;
            if (t.duration_minutes >= 10) reached10++;
            if (t.duration_minutes >= 20) reached20++;
            if (t.duration_minutes >= 30) reached30++;
        });

        const total = started || 1;
        const data = [
            { stage: 'Started', count: started, percentage: 100 },
            { stage: '10+ mins', count: reached10, percentage: Math.round((reached10 / total) * 100) },
            { stage: '20+ mins', count: reached20, percentage: Math.round((reached20 / total) * 100) },
            { stage: '30+ mins', count: reached30, percentage: Math.round((reached30 / total) * 100) },
        ];

        return { data };
    } catch (error) {
        console.error('Error fetching deep work funnel:', error);
        return { error: 'Failed to fetch funnel' };
    }
}

// AI Usage Per User (mock)
export async function getAIUsagePerUser(): Promise<{ data?: Array<{ userId: string; name: string; routineRequests: number; summaryRequests: number; totalTokens: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    // Mock data - would need AI usage logging
    const mockData = [
        { userId: '1', name: 'User A', routineRequests: 15, summaryRequests: 8, totalTokens: 12500 },
        { userId: '2', name: 'User B', routineRequests: 10, summaryRequests: 12, totalTokens: 9800 },
        { userId: '3', name: 'User C', routineRequests: 8, summaryRequests: 5, totalTokens: 7200 },
        { userId: '4', name: 'User D', routineRequests: 5, summaryRequests: 3, totalTokens: 4500 },
    ];

    return { data: mockData };
}

// Productivity Index
export async function getProductivityIndex(): Promise<{ data?: Array<{ userId: string; name: string; score: number; deepWorkMinutes: number; distractionMinutes: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { data: profiles } = await (supabase as any)
            .from('profiles')
            .select('id, full_name')
            .limit(20);

        const results = await Promise.all(
            (profiles || []).map(async (p: { id: string; full_name: string }) => {
                const { data: tasks } = await (supabase as any)
                    .from('tasks')
                    .select('duration_minutes, category_id')
                    .eq('user_id', p.id)
                    .not('duration_minutes', 'is', null);

                let deepWork = 0;
                let distraction = 0;

                (tasks || []).forEach((t: { duration_minutes: number }) => {
                    if (t.duration_minutes >= 25) deepWork += t.duration_minutes;
                    else distraction += t.duration_minutes;
                });

                const score = Math.max(0, deepWork - distraction * 0.5);

                return {
                    userId: p.id,
                    name: p.full_name || 'Unknown',
                    score: Math.round(score),
                    deepWorkMinutes: deepWork,
                    distractionMinutes: distraction,
                };
            })
        );

        return { data: results.sort((a, b) => b.score - a.score) };
    } catch (error) {
        console.error('Error fetching productivity index:', error);
        return { error: 'Failed to fetch productivity' };
    }
}

// Productivity Distribution Histogram
export async function getProductivityDistribution(): Promise<{ data?: Array<{ bucket: string; count: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const prodResult = await getProductivityIndex();
    if (prodResult.error || !prodResult.data) return { error: prodResult.error || 'No data' };

    const buckets = { '0-20': 0, '20-40': 0, '40-60': 0, '60-100': 0, '100+': 0 };

    prodResult.data.forEach((user) => {
        const score = user.score;
        if (score < 20) buckets['0-20']++;
        else if (score < 40) buckets['20-40']++;
        else if (score < 60) buckets['40-60']++;
        else if (score < 100) buckets['60-100']++;
        else buckets['100+']++;
    });

    const data = Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
    return { data };
}

// User Lifecycle Stages
export async function getUserLifecycleStages(): Promise<{ data?: Array<{ stage: string; count: number; users: Array<{ id: string; name: string }> }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();
    const now = new Date();

    try {
        const { data: profiles } = await (supabase as any)
            .from('profiles')
            .select('id, full_name, created_at, last_login');

        const stages: Record<string, Array<{ id: string; name: string }>> = {
            'New': [],
            'Active': [],
            'Returning': [],
            'Slipping': [],
            'Churn Risk': [],
        };

        (profiles || []).forEach((p: { id: string; full_name: string; created_at: string; last_login: string | null }) => {
            const created = new Date(p.created_at);
            const lastLogin = p.last_login ? new Date(p.last_login) : created;
            const daysSinceCreation = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

            const user = { id: p.id, name: p.full_name || 'Unknown' };

            if (daysSinceCreation <= 3) stages['New'].push(user);
            else if (daysSinceLogin <= 1) stages['Active'].push(user);
            else if (daysSinceLogin <= 3) stages['Returning'].push(user);
            else if (daysSinceLogin <= 7) stages['Slipping'].push(user);
            else stages['Churn Risk'].push(user);
        });

        const data = Object.entries(stages).map(([stage, users]) => ({
            stage,
            count: users.length,
            users: users.slice(0, 5),
        }));

        return { data };
    } catch (error) {
        console.error('Error fetching lifecycle stages:', error);
        return { error: 'Failed to fetch lifecycle' };
    }
}

// Cohort Waterfall
export async function getCohortWaterfall(): Promise<{ data?: Array<{ cohort: string; week1: number; week2: number; week3: number; week4: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();
    const now = new Date();

    try {
        const { data: profiles } = await (supabase as any)
            .from('profiles')
            .select('created_at, last_login')
            .order('created_at', { ascending: true });

        // Group by week
        const cohorts: Record<string, { total: number; week1: number; week2: number; week3: number; week4: number }> = {};

        (profiles || []).forEach((p: { created_at: string; last_login: string | null }) => {
            const created = new Date(p.created_at);
            const weekNum = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 7));
            if (weekNum > 8) return; // Only show last 8 weeks

            const cohortKey = `Week -${weekNum}`;
            if (!cohorts[cohortKey]) {
                cohorts[cohortKey] = { total: 0, week1: 0, week2: 0, week3: 0, week4: 0 };
            }

            cohorts[cohortKey].total++;

            if (p.last_login) {
                const lastLogin = new Date(p.last_login);
                const weeksSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24 * 7));
                if (weeksSinceLogin < 1) cohorts[cohortKey].week1++;
                if (weeksSinceLogin < 2) cohorts[cohortKey].week2++;
                if (weeksSinceLogin < 3) cohorts[cohortKey].week3++;
                if (weeksSinceLogin < 4) cohorts[cohortKey].week4++;
            }
        });

        const data = Object.entries(cohorts).map(([cohort, vals]) => ({
            cohort,
            week1: vals.total > 0 ? Math.round((vals.week1 / vals.total) * 100) : 0,
            week2: vals.total > 0 ? Math.round((vals.week2 / vals.total) * 100) : 0,
            week3: vals.total > 0 ? Math.round((vals.week3 / vals.total) * 100) : 0,
            week4: vals.total > 0 ? Math.round((vals.week4 / vals.total) * 100) : 0,
        }));

        return { data: data.slice(0, 6) };
    } catch (error) {
        console.error('Error fetching cohort waterfall:', error);
        return { error: 'Failed to fetch cohorts' };
    }
}

// Power Users
export async function getPowerUsers(): Promise<{ data?: Array<{ rank: number; userId: string; name: string; totalMinutes: number; avgDeepWork: number; streak: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();

    try {
        const { data: profiles } = await (supabase as any)
            .from('profiles')
            .select('id, full_name');

        const users = await Promise.all(
            (profiles || []).map(async (p: { id: string; full_name: string }) => {
                const { data: tasks } = await (supabase as any)
                    .from('tasks')
                    .select('duration_minutes, created_at')
                    .eq('user_id', p.id)
                    .not('duration_minutes', 'is', null)
                    .order('created_at', { ascending: false });

                const totalMinutes = (tasks || []).reduce(
                    (sum: number, t: { duration_minutes: number }) => sum + t.duration_minutes,
                    0
                );

                const deepWorkTasks = (tasks || []).filter(
                    (t: { duration_minutes: number }) => t.duration_minutes >= 25
                );
                const avgDeepWork = deepWorkTasks.length > 0
                    ? Math.round(deepWorkTasks.reduce((s: number, t: { duration_minutes: number }) => s + t.duration_minutes, 0) / deepWorkTasks.length)
                    : 0;

                return {
                    userId: p.id,
                    name: p.full_name || 'Unknown',
                    totalMinutes,
                    avgDeepWork,
                    streak: Math.floor(Math.random() * 30), // Placeholder
                };
            })
        );

        const sorted = users.sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, 10);
        const data = sorted.map((u, i) => ({ rank: i + 1, ...u }));

        return { data };
    } catch (error) {
        console.error('Error fetching power users:', error);
        return { error: 'Failed to fetch power users' };
    }
}

// Category Heatmap
export async function getCategoryHeatmap(): Promise<{ data?: Array<{ category: string; day: number; minutes: number }>; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const supabase = await createClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
        const { data: categories } = await (supabase as any)
            .from('categories')
            .select('id, name');

        const { data: tasks } = await (supabase as any)
            .from('tasks')
            .select('category_id, duration_minutes, created_at')
            .gte('created_at', sevenDaysAgo.toISOString())
            .not('duration_minutes', 'is', null);

        const categoryMap = new Map<string, string>();
        (categories || []).forEach((c: { id: string; name: string }) => {
            categoryMap.set(c.id, c.name);
        });
        const heatmap: Record<string, number> = {};

        (tasks || []).forEach((t: { category_id: string; duration_minutes: number; created_at: string }) => {
            const catName = categoryMap.get(t.category_id) || 'Uncategorized';
            const day = new Date(t.created_at).getDay();
            const key = `${catName}-${day}`;
            heatmap[key] = (heatmap[key] || 0) + t.duration_minutes;
        });

        const data: Array<{ category: string; day: number; minutes: number }> = [];
        categoryMap.forEach((name) => {
            for (let day = 0; day < 7; day++) {
                data.push({
                    category: name,
                    day,
                    minutes: heatmap[`${name}-${day}`] || 0,
                });
            }
        });

        return { data };
    } catch (error) {
        console.error('Error fetching category heatmap:', error);
        return { error: 'Failed to fetch heatmap' };
    }
}

// Safe SQL Runner (read-only)
export async function runCustomAdminQuery(sql: string): Promise<{ data?: unknown[]; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    // Validate: only SELECT allowed
    const trimmed = sql.trim().toLowerCase();
    if (!trimmed.startsWith('select')) {
        return { error: 'Only SELECT queries are allowed' };
    }

    // Block dangerous keywords
    const blocked = ['insert', 'update', 'delete', 'drop', 'alter', 'create', 'truncate', 'grant', 'revoke'];
    for (const word of blocked) {
        if (trimmed.includes(word)) {
            return { error: `Blocked keyword detected: ${word}` };
        }
    }

    const supabase = await createClient();

    try {
        // Use RPC or direct query - this is a simplified version
        // In production, use a dedicated read-only RPC function
        const { data, error } = await (supabase as any).rpc('admin_query', { query_text: sql });

        if (error) {
            return { error: error.message };
        }

        return { data: data || [] };
    } catch (error) {
        console.error('Query error:', error);
        return { error: 'Query execution failed. Make sure admin_query RPC exists.' };
    }
}

// Export helpers
export async function exportUsersCSV(): Promise<{ csv?: string; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const result = await getAllUsers();
    if (result.error || !result.users) return { error: result.error || 'No data' };

    const headers = ['ID', 'Name', 'Email', 'Created', 'Last Login', 'Tasks', 'Minutes'];
    const rows = result.users.map(u => [
        u.id,
        u.full_name || '',
        u.email || '',
        u.created_at,
        u.last_login || '',
        u.task_count,
        u.total_minutes,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return { csv };
}

// Aliased export for ExportPanel
export async function adminExportUsersCSV(): Promise<{ csv?: string; filename?: string; error?: string }> {
    const result = await exportUsersCSV();
    if (result.error) return { error: result.error };
    return { csv: result.csv, filename: 'clarvu_all_users.csv' };
}

export async function adminExportUserUsageCSV(): Promise<{ csv?: string; filename?: string; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const result = await getAllUsers();
    if (result.error || !result.users) return { error: result.error || 'No data' };

    const headers = ['User ID', 'Full Name', 'Email', 'Total Tasks', 'Total Minutes', 'Last Login'];
    const rows = result.users.map(u => [
        u.id,
        (u.full_name || '').replace(/,/g, ''),
        u.email || '',
        u.task_count,
        u.total_minutes,
        u.last_login || 'Never',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return { csv, filename: 'clarvu_user_usage.csv' };
}

export async function adminExportSystemStatsJSON(): Promise<{ json?: string; filename?: string; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const stats = await getAdminStats();
    if (stats.error) return { error: stats.error };

    const json = JSON.stringify({
        exportedAt: new Date().toISOString(),
        stats: stats.stats,
    }, null, 2);

    return { json, filename: 'clarvu_system_stats.json' };
}

export async function adminExportLogsCSV(range: string = '7d'): Promise<{ csv?: string; filename?: string; error?: string }> {
    const auth = await verifyAdmin();
    if ('error' in auth) return { error: auth.error };

    const result = await getSystemLogs();
    if (result.error || !result.logs) return { error: result.error || 'No logs' };

    // Filter by range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
        case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
        default:
            startDate = new Date(0); // All time
    }

    const filteredLogs = result.logs.filter(log => new Date(log.created_at) >= startDate);

    const headers = ['ID', 'Type', 'Message', 'Created At'];
    const rows = filteredLogs.map(log => [
        log.id,
        log.log_type,
        (log.message || '').replace(/,/g, ';').replace(/\n/g, ' '),
        log.created_at,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return { csv, filename: `clarvu_logs_${range}.csv` };
}

