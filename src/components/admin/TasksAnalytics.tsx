'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getTasksTrend, getCategoryDistribution } from '@/app/ppadminpp/actions';
import { ListTodo, CheckCircle } from 'lucide-react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface TasksTrendData {
    date: string;
    tasks: number;
    completed: number;
}

interface CategoryData {
    name: string;
    count: number;
    color: string;
    [key: string]: string | number;
}

export function TasksAnalytics() {
    const { currentTheme } = useTheme();
    const [trendData, setTrendData] = useState<TasksTrendData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const [trendResult, categoryResult] = await Promise.all([
                getTasksTrend(14),
                getCategoryDistribution(),
            ]);

            if (trendResult.data) setTrendData(trendResult.data);
            if (categoryResult.data) {
                // Map data to ensure index signature compatibility
                const mappedData: CategoryData[] = categoryResult.data.map(item => ({
                    name: item.name,
                    count: item.count,
                    color: item.color,
                }));
                setCategoryData(mappedData);
            }
        });
    }, []);

    const totalTasks = trendData.reduce((sum, d) => sum + d.tasks, 0);
    const totalCompleted = trendData.reduce((sum, d) => sum + d.completed, 0);
    const completionRate = totalTasks > 0 ? ((totalCompleted / totalTasks) * 100).toFixed(1) : '0';

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-2xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
                        >
                            <ListTodo className="w-4 h-4 text-amber-500" />
                        </div>
                        <span style={{ color: currentTheme.colors.mutedForeground }}>Total Tasks</span>
                    </div>
                    <p
                        className="text-3xl font-bold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {totalTasks}
                    </p>
                    <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                        Last 14 days
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-2xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                        >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <span style={{ color: currentTheme.colors.mutedForeground }}>Completed</span>
                    </div>
                    <p
                        className="text-3xl font-bold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {totalCompleted}
                    </p>
                    <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                        {completionRate}% completion rate
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-2xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span style={{ color: currentTheme.colors.mutedForeground }}>Categories</span>
                    </div>
                    <p
                        className="text-3xl font-bold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {categoryData.length}
                    </p>
                    <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                        Active categories
                    </p>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks Trend Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <h4
                        className="text-sm font-semibold mb-4"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Tasks per Day
                    </h4>
                    {isPending ? (
                        <div className="h-64 skeleton rounded-xl" />
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }}
                                        stroke="rgba(255,255,255,0.1)"
                                    />
                                    <YAxis
                                        tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }}
                                        stroke="rgba(255,255,255,0.1)"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: currentTheme.colors.card,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                            borderRadius: '12px',
                                        }}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Legend />
                                    <Bar dataKey="tasks" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Created" />
                                    <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </motion.div>

                {/* Category Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-2xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <h4
                        className="text-sm font-semibold mb-4"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Category Distribution
                    </h4>
                    {isPending ? (
                        <div className="h-64 skeleton rounded-xl" />
                    ) : categoryData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={40}
                                        paddingAngle={2}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: currentTheme.colors.card,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                            borderRadius: '12px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div
                            className="h-64 flex items-center justify-center text-sm"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            No category data available
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
