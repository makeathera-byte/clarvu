'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getCountryAnalytics } from '@/app/ppadminpp/actions';
import { Globe } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

interface CountryData {
    country: string;
    count: number;
    percentage: number;
    [key: string]: string | number;
}

export function CountryPieChart() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<CountryData[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getCountryAnalytics();
            if (result.data) {
                const mapped: CountryData[] = result.data.map(d => ({
                    country: d.country,
                    count: d.count,
                    percentage: d.percentage,
                }));
                setData(mapped);
            }
        });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl border"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                >
                    <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        User Geography
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Distribution by country
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="h-64 skeleton rounded-xl" />
            ) : (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="country"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={50}
                                paddingAngle={2}
                                label={({ payload }) => payload ? `${payload.country}: ${payload.percentage}%` : ''}
                                labelLine={false}
                            >
                                {data.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: currentTheme.colors.card,
                                    border: `1px solid ${currentTheme.colors.border}`,
                                    borderRadius: '12px',
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}
