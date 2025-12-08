'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { TaskSuggestion } from '@/app/tasks/suggestionsActions';
import { Sparkles } from 'lucide-react';

interface SuggestionsListProps {
    suggestions: TaskSuggestion[];
    query: string;
    selectedIndex: number;
    onSelect: (suggestion: TaskSuggestion) => void;
    onHover: (index: number) => void;
    categories?: Array<{ id: string; name: string; color: string }>;
}

export function SuggestionsList({
    suggestions,
    query,
    selectedIndex,
    onSelect,
    onHover,
    categories = [],
}: SuggestionsListProps) {
    const { currentTheme } = useTheme();

    if (suggestions.length === 0) {
        return null;
    }

    // Get category by ID
    const getCategory = (categoryId: string | null) => {
        if (!categoryId) return null;
        return categories.find(c => c.id === categoryId);
    };

    // Highlight matching text
    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;

        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text;

        const before = text.slice(0, index);
        const match = text.slice(index, index + query.length);
        const after = text.slice(index + query.length);

        return (
            <>
                {before}
                <span style={{ fontWeight: 600, color: currentTheme.colors.primary }}>
                    {match}
                </span>
                {after}
            </>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1 rounded-xl border backdrop-blur-xl z-[100] overflow-hidden"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                }}
            >
                {/* Header */}
                <div
                    className="px-3 py-2 border-b flex items-center gap-2"
                    style={{ borderColor: currentTheme.colors.border }}
                >
                    <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
                    <span className="text-xs font-medium" style={{ color: currentTheme.colors.mutedForeground }}>
                        Suggestions
                    </span>
                </div>

                {/* Suggestions list */}
                <div className="py-1">
                    {suggestions.map((suggestion, index) => {
                        const category = getCategory(suggestion.category_id);
                        const isSelected = index === selectedIndex;

                        return (
                            <motion.button
                                key={suggestion.id}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                onClick={() => onSelect(suggestion)}
                                onMouseEnter={() => onHover(index)}
                                className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors"
                                style={{
                                    backgroundColor: isSelected
                                        ? `${currentTheme.colors.primary}10`
                                        : 'transparent',
                                    borderLeft: isSelected
                                        ? `2px solid ${currentTheme.colors.primary}`
                                        : '2px solid transparent',
                                }}
                            >
                                {/* Category dot */}
                                {category && (
                                    <div
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: category.color }}
                                    />
                                )}

                                {/* Suggestion text */}
                                <span
                                    className="flex-1 text-sm truncate"
                                    style={{ color: currentTheme.colors.foreground }}
                                >
                                    {highlightMatch(suggestion.text, query)}
                                </span>

                                {/* Global badge */}
                                {suggestion.is_global && (
                                    <span
                                        className="text-xs px-1.5 py-0.5 rounded"
                                        style={{
                                            backgroundColor: `${currentTheme.colors.muted}`,
                                            color: currentTheme.colors.mutedForeground,
                                        }}
                                    >
                                        Global
                                    </span>
                                )}

                                {/* Frequency indicator (for user suggestions) */}
                                {!suggestion.is_global && suggestion.frequency > 1 && (
                                    <span
                                        className="text-xs"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    >
                                        ×{suggestion.frequency}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Footer hint */}
                <div
                    className="px-3 py-1.5 border-t text-xs"
                    style={{
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.mutedForeground,
                    }}
                >
                    <span className="opacity-70">↑↓ Navigate • Enter Select • Esc Close</span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
