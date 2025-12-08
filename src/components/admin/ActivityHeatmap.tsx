'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getActivityHeatmap } from '@/app/ppadminpp/actions';
import { Activity } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ActivityHeatmap() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<Array<{ day: number; hour: number; value: number }>>([]);
    const [isPending, startTransition] = useTransition();
    const [maxValue, setMaxValue] = useState(1);

    useEffect(() => {
        startTransition(async () => {
            const result = await getActivityHeatmap();
            if (result.data) {
                setData(result.data);
                const max = Math.max(...result.data.map(d => d.value), 1);
                setMaxValue(max);
            }
        });
    }, []);

    const getColor = (value: number) => {
        const intensity = value / maxValue;
        if (intensity === 0) return currentTheme.colors.border;
        if (intensity < 0.25) return '#22c55e33';
        if (intensity < 0.5) return '#22c55e66';
        if (intensity < 0.75) return '#22c55e99';
        return '#22c55e';
    };

    const getValue = (day: number, hour: number) => {
        const cell = data.find(d => d.day === day && d.hour === hour);
        return cell?.value || 0;
    };

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
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                >
                    <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Activity Heatmap
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Task completions by day &amp; hour
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="h-48 skeleton rounded-xl" />
            ) : (
                <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                        {/* Hour labels */}
                        <div className="flex ml-10 mb-1">
                            {HOURS.filter((_, i) => i % 3 === 0).map(h => (
                                <div
                                    key={h}
                                    className="text-xs w-[36px] text-center"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {h}:00
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        {DAYS.map((day, dayIndex) => (
                            <div key={day} className="flex items-center gap-1 mb-1">
                                <div
                                    className="w-8 text-xs text-right pr-2"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {day}
                                </div>
                                {HOURS.map(hour => {
                                    const value = getValue(dayIndex, hour);
                                    return (
                                        <div
                                            key={hour}
                                            className="w-3 h-3 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-white/30"
                                            style={{ backgroundColor: getColor(value) }}
                                            title={`${day} ${hour}:00 - ${value} completions`}
                                        />
                                    );
                                })}
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                Less
                            </span>
                            {[0, 0.25, 0.5, 0.75, 1].map(i => (
                                <div
                                    key={i}
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: getColor(i * maxValue) }}
                                />
                            ))}
                            <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                More
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
