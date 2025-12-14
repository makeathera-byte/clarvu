'use client';

import { GoalPriority } from '@/app/goals/actions/goalsActions';
import { Flame, Signal, SignalMedium, SignalLow } from 'lucide-react';

interface PriorityBadgeProps {
    priority: GoalPriority;
    size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
    const config = {
        high: {
            label: 'High',
            icon: Flame,
            bg: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: 'rgba(239, 68, 68, 0.3)',
        },
        medium: {
            label: 'Medium',
            icon: SignalMedium,
            bg: 'rgba(251, 146, 60, 0.15)',
            color: '#fb923c',
            border: 'rgba(251, 146, 60, 0.3)',
        },
        low: {
            label: 'Low',
            icon: SignalLow,
            bg: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            border: 'rgba(34, 197, 94, 0.3)',
        },
    };

    const theme = config[priority];
    const Icon = theme.icon;
    const isSmall = size === 'sm';

    return (
        <div
            className={`inline-flex items-center gap-1 ${isSmall ? 'px-2 py-0.5' : 'px-2.5 py-1'} rounded-full border font-medium transition-all`}
            style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.color,
                fontSize: isSmall ? '0.7rem' : '0.75rem',
            }}
        >
            <Icon className={isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            <span className="uppercase tracking-wider">{theme.label}</span>
        </div>
    );
}
