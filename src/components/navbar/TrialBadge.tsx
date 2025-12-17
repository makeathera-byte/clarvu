/**
 * Trial Badge Component
 * 
 * Displays trial status in navbar showing days remaining with premium aesthetic
 */

'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export function TrialBadge() {
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTrialStatus() {
            try {
                const response = await fetch('/api/trial/status');
                if (response.ok) {
                    const data = await response.json();
                    setDaysRemaining(data.daysRemaining);
                }
            } catch (error) {
                console.error('Failed to load trial status:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadTrialStatus();
    }, []);

    // Don't show anything if loading or no trial
    if (isLoading || daysRemaining === null || daysRemaining <= 0) {
        return null;
    }

    // Determine styling based on days remaining
    const isUrgent = daysRemaining <= 3;

    return (
        <div className="relative group">
            <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full
                backdrop-blur-md border transition-all duration-300
                hover:scale-105 cursor-default
                ${isUrgent
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30 hover:border-amber-400/50'
                    : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/30 hover:border-emerald-400/50'
                }
            `}>
                {/* Icon with subtle animation */}
                <Sparkles className={`w-4 h-4 ${isUrgent ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />

                {/* Text */}
                <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${isUrgent ? 'text-amber-700' : 'text-emerald-700'}`}>
                        Trial
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className={`text-xs font-bold ${isUrgent ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                    </span>
                </div>

                {/* Glow effect on hover */}
                <div className={`
                    absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300 blur-md -z-10
                    ${isUrgent ? 'bg-amber-400/20' : 'bg-emerald-400/20'}
                `} />
            </div>
        </div>
    );
}
