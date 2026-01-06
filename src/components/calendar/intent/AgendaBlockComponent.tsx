'use client';

import { AgendaBlock } from '@/lib/store/useAgendaStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { motion } from 'framer-motion';
import { Clock, Sunrise, Sun, Sunset, Calendar as CalendarIcon } from 'lucide-react';

interface AgendaBlockComponentProps {
    block: AgendaBlock;
    onClick?: () => void;
}

/**
 * Agenda Block Component
 * Lighter, more transparent than goals
 * Represents flexible planning (morning/afternoon/evening)
 */
export function AgendaBlockComponent({ block, onClick }: AgendaBlockComponentProps) {
    const { currentTheme } = useTheme();

    const getTimeIcon = () => {
        switch (block.time_of_day) {
            case 'morning':
                return <Sunrise className="w-4 h-4" />;
            case 'afternoon':
                return <Sun className="w-4 h-4" />;
            case 'evening':
                return <Sunset className="w-4 h-4" />;
            default:
                return <CalendarIcon className="w-4 h-4" />;
        }
    };

    const getTimeLabel = () => {
        switch (block.time_of_day) {
            case 'morning':
                return 'Morning';
            case 'afternoon':
                return 'Afternoon';
            case 'evening':
                return 'Evening';
            case 'all_day':
                return 'All Day';
            default:
                return 'Flexible';
        }
    };

    const formatDateRange = () => {
        const start = new Date(block.start_date);
        const end = new Date(block.end_date);

        if (block.start_date === block.end_date) {
            return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const blockColor = block.color || currentTheme.colors.primary;

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full text-left p-3 rounded-lg transition-all duration-200 shadow-sm"
            style={{
                backgroundColor: `${blockColor}12`,
                border: `1px dashed ${blockColor}40`,
            }}
        >
            <div className="flex items-start gap-2">
                <div style={{ color: blockColor }}>
                    {getTimeIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <div
                        className="font-semibold text-sm"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {block.title}
                    </div>

                    {block.description && (
                        <p
                            className="text-xs mt-1 line-clamp-2"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {block.description}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                        {block.time_of_day && (
                            <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                    backgroundColor: `${blockColor}20`,
                                    color: blockColor,
                                }}
                            >
                                {getTimeLabel()}
                            </span>
                        )}

                        <span
                            className="text-xs"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {formatDateRange()}
                        </span>
                    </div>
                </div>
            </div>
        </motion.button>
    );
}
