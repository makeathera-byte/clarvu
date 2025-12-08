'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { getGreeting, getTodayString } from '@/lib/utils/date';
import { Settings, Calendar } from 'lucide-react';

interface DashboardHeaderProps {
    userName?: string | null;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
    const { currentTheme } = useTheme();

    // Get first name from full name
    const firstName = userName?.split(' ')[0] || 'there';

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
        >
            {/* Left: Greeting */}
            <div>
                <h1
                    className="text-3xl font-bold mb-1"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    {getGreeting()}, {firstName}
                </h1>
                <p
                    className="flex items-center gap-2 text-sm"
                    style={{ color: currentTheme.colors.mutedForeground }}
                >
                    <Calendar className="w-4 h-4" />
                    {getTodayString()}
                </p>
            </div>

            {/* Right: Theme toggle + Settings button */}
            <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link href="/settings/theme">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 15 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 rounded-2xl backdrop-blur-sm border transition-colors"
                        style={{
                            backgroundColor: currentTheme.colors.card,
                            borderColor: currentTheme.colors.border,
                        }}
                    >
                        <Settings
                            className="w-5 h-5"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        />
                    </motion.div>
                </Link>
            </div>
        </motion.header>
    );
}
