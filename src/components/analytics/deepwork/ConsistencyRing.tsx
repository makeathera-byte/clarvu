'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Flame } from 'lucide-react';

interface ConsistencyRingProps {
    percent: number;
    currentStreak: number;
    bestStreak: number;
    daysWorked: number;
    totalDays: number;
}

export function ConsistencyRing({ percent, currentStreak, bestStreak, daysWorked, totalDays }: ConsistencyRingProps) {
    const { currentTheme } = useTheme();

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    const getColor = () => {
        if (percent >= 80) return '#22c55e';
        if (percent >= 50) return '#eab308';
        return '#ef4444';
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
                {/* Background ring */}
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="45"
                        fill="none"
                        stroke={currentTheme.colors.muted}
                        strokeWidth="10"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="45"
                        fill="none"
                        stroke={getColor()}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>{percent}%</p>
                    <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>Consistency</p>
                </div>
            </div>

            {/* Streak badge */}
            {currentStreak > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full mt-3"
                    style={{ backgroundColor: '#ef444420', color: '#ef4444' }}
                >
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentStreak} day streak</span>
                </motion.div>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4 text-center">
                <div>
                    <p className="text-lg font-bold" style={{ color: currentTheme.colors.foreground }}>{daysWorked}</p>
                    <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>Days Worked</p>
                </div>
                <div>
                    <p className="text-lg font-bold" style={{ color: currentTheme.colors.foreground }}>{bestStreak}</p>
                    <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>Best Streak</p>
                </div>
            </div>
        </div>
    );
}
