'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';

interface QualityGaugeProps {
    score: number;
    label?: string;
}

export function QualityGauge({ score, label = 'Session Quality' }: QualityGaugeProps) {
    const { currentTheme } = useTheme();

    // Determine color based on score
    const getColor = () => {
        if (score >= 80) return '#22c55e';
        if (score >= 50) return '#eab308';
        return '#ef4444';
    };

    const color = getColor();
    const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees

    return (
        <div className="flex flex-col items-center">
            <p className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.mutedForeground }}>{label}</p>

            <div className="relative w-40 h-20 overflow-hidden">
                {/* Background arc */}
                <div
                    className="absolute inset-0 rounded-t-full"
                    style={{
                        background: `conic-gradient(from -90deg, ${currentTheme.colors.muted} 0deg, ${currentTheme.colors.muted} 180deg)`,
                    }}
                />

                {/* Colored arc */}
                <motion.div
                    className="absolute inset-0 rounded-t-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        background: `conic-gradient(from -90deg, ${color} 0deg, ${color} ${score * 1.8}deg, transparent ${score * 1.8}deg)`,
                    }}
                />

                {/* Center cover */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-14 rounded-t-full"
                    style={{ backgroundColor: currentTheme.colors.card }}
                />

                {/* Needle */}
                <motion.div
                    className="absolute bottom-0 left-1/2 origin-bottom"
                    style={{ width: 2, height: 60, backgroundColor: currentTheme.colors.foreground }}
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ type: 'spring', damping: 15 }}
                />

                {/* Center dot */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.foreground }}
                />
            </div>

            <p className="text-3xl font-bold mt-2" style={{ color }}>
                {score}%
            </p>
        </div>
    );
}
