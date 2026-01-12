'use client';

import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { useCalendarViewStore, CalendarView } from '@/lib/store/useCalendarViewStore';
import { useCalendarModeStore } from '@/lib/store/useCalendarModeStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { CalendarModeToggle } from './CalendarModeToggle';

export function CalendarHeader() {
    const { view, selectedDate, setView, navigateNext, navigatePrevious, goToToday } = useCalendarViewStore();
    const { currentTheme } = useTheme();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const formatDateDisplay = () => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
        };

        switch (view) {
            case 'day':
                return selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            case 'week':
                const weekStart = new Date(selectedDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            case 'month':
                return selectedDate.toLocaleDateString('en-US', options);
            case 'year':
                return selectedDate.getFullYear().toString();
            default:
                return '';
        }
    };

    return (
        <>
            <div
                className="border-b backdrop-blur-md sticky top-20 z-30 shadow-sm"
                style={{
                    backgroundColor: `${currentTheme.colors.card}f0`,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <div className="flex items-center justify-between p-4 gap-4 max-w-[1800px] mx-auto">
                    {/* Left: Mode Toggle (Execution/Intent) */}
                    <div className="flex items-center gap-3">
                        <CalendarModeToggle />
                    </div>

                    {/* Center: Date Display & Navigation */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            onClick={navigatePrevious}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl transition-colors"
                            style={{
                                color: currentTheme.colors.foreground,
                                backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.colors.muted}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>

                        <div className="min-w-[200px] text-center">
                            <h2 className="text-base font-bold" style={{ color: currentTheme.colors.foreground }}>
                                {formatDateDisplay()}
                            </h2>
                        </div>

                        <motion.button
                            onClick={navigateNext}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl transition-colors"
                            style={{
                                color: currentTheme.colors.foreground,
                                backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.colors.muted}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            onClick={goToToday}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 font-medium shadow-sm text-sm"
                            style={{
                                backgroundColor: `${currentTheme.colors.muted}80`,
                                color: currentTheme.colors.foreground,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.colors.muted}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${currentTheme.colors.muted}80`}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Today</span>
                        </motion.button>

                        <motion.button
                            onClick={() => setIsCreateModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg text-sm"
                            style={{
                                backgroundColor: currentTheme.colors.primary,
                                color: currentTheme.colors.primaryForeground,
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Task</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
}
