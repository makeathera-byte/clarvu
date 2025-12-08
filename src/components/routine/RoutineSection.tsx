'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { RoutineCard } from './RoutineCard';
import { Sunrise, Sun, Moon, LucideIcon } from 'lucide-react';

interface RoutineItem {
    time: string;
    activity: string;
    duration: string;
    category?: string;
}

interface RoutineSectionProps {
    title: 'Morning' | 'Afternoon' | 'Evening';
    items: RoutineItem[];
    delay: number;
}

const sectionConfig: Record<string, { icon: LucideIcon; gradient: string }> = {
    Morning: {
        icon: Sunrise,
        gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
    },
    Afternoon: {
        icon: Sun,
        gradient: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
    },
    Evening: {
        icon: Moon,
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
};

export function RoutineSection({ title, items, delay }: RoutineSectionProps) {
    const { currentTheme } = useTheme();
    const config = sectionConfig[title];
    const Icon = config.icon;

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="mb-6"
        >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: config.gradient }}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <h3
                    className="text-lg font-semibold"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    {title}
                </h3>
            </div>

            {/* Items */}
            <div className="space-y-3 pl-2">
                {items.map((item, index) => (
                    <RoutineCard
                        key={`${title}-${index}`}
                        item={item}
                        index={index}
                        delay={delay + 0.1}
                    />
                ))}
            </div>
        </motion.div>
    );
}
