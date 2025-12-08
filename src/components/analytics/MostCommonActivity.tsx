'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Repeat, Tag } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    category_id: string | null;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

interface MostCommonActivityProps {
    tasks: Task[];
    categories: Category[];
}

export function MostCommonActivity({ tasks, categories }: MostCommonActivityProps) {
    const { currentTheme } = useTheme();

    // Count title occurrences
    const titleCounts: Record<string, { count: number; categoryId: string | null }> = {};

    tasks.forEach(task => {
        const title = task.title.toLowerCase().trim();
        if (!titleCounts[title]) {
            titleCounts[title] = { count: 0, categoryId: task.category_id };
        }
        titleCounts[title].count++;
    });

    // Find most common
    let mostCommonTitle = '';
    let maxCount = 0;
    let categoryId: string | null = null;

    Object.entries(titleCounts).forEach(([title, data]) => {
        if (data.count > maxCount) {
            maxCount = data.count;
            mostCommonTitle = title;
            categoryId = data.categoryId;
        }
    });

    // Get category
    const category = categoryId ? categories.find(c => c.id === categoryId) : null;

    // Capitalize title
    const displayTitle = mostCommonTitle
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="p-6 rounded-2xl border backdrop-blur-sm mb-6"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Header */}
            <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: currentTheme.colors.foreground }}
            >
                <Repeat className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                Most Common Activity
            </h3>

            {mostCommonTitle ? (
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                            backgroundColor: category?.color
                                ? `${category.color}20`
                                : currentTheme.colors.muted,
                        }}
                    >
                        <Tag
                            className="w-6 h-6"
                            style={{ color: category?.color || currentTheme.colors.mutedForeground }}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-lg font-semibold truncate"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {displayTitle}
                        </p>

                        <div className="flex items-center gap-3 mt-1">
                            {/* Count */}
                            <span
                                className="text-sm"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Completed {maxCount} times
                            </span>

                            {/* Category badge */}
                            {category && (
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: `${category.color}20`,
                                        color: category.color,
                                    }}
                                >
                                    {category.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <Repeat
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    />
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        No repeated activities yet
                    </p>
                </div>
            )}
        </motion.div>
    );
}
