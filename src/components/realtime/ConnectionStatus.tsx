'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

type Status = 'connected' | 'reconnecting' | 'disconnected';

const statusConfig: Record<Status, { color: string; icon: React.ElementType; label: string }> = {
    connected: { color: '#22c55e', icon: Wifi, label: 'Connected' },
    reconnecting: { color: '#eab308', icon: RefreshCw, label: 'Reconnecting' },
    disconnected: { color: '#ef4444', icon: WifiOff, label: 'Offline' },
};

interface ConnectionStatusProps {
    status?: Status;
}

export function ConnectionStatus({ status: externalStatus }: ConnectionStatusProps) {
    const { currentTheme } = useTheme();
    const [status, setStatus] = useState<Status>(externalStatus || 'disconnected');
    const [showLabel, setShowLabel] = useState(false);

    // Update status when external prop changes
    useEffect(() => {
        if (externalStatus) {
            setStatus(externalStatus);
        }
    }, [externalStatus]);

    // Listen for realtime-status attribute changes on parent
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-realtime-status') {
                    const target = mutation.target as HTMLElement;
                    const newStatus = target.getAttribute('data-realtime-status') as Status;
                    if (newStatus) {
                        setStatus(newStatus);
                    }
                }
            });
        });

        // Find parent with data-realtime-status
        const findParent = () => {
            let el: HTMLElement | null = document.querySelector('[data-realtime-status]');
            if (el) {
                const currentStatus = el.getAttribute('data-realtime-status') as Status;
                if (currentStatus) setStatus(currentStatus);
                observer.observe(el, { attributes: true });
            }
        };

        // Try immediately and after a delay
        findParent();
        const timeout = setTimeout(findParent, 1000);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, []);

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <motion.div
            className="relative flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setShowLabel(true)}
            onMouseLeave={() => setShowLabel(false)}
        >
            {/* Status dot */}
            <div className="relative">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                />
                {status === 'connected' && (
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: config.color }}
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 2 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                    />
                )}
            </div>

            {/* Label tooltip */}
            <AnimatePresence>
                {showLabel && (
                    <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="absolute left-4 px-2 py-1 rounded-lg text-xs whitespace-nowrap flex items-center gap-1 z-50"
                        style={{
                            backgroundColor: currentTheme.colors.card,
                            border: `1px solid ${currentTheme.colors.border}`,
                            color: currentTheme.colors.foreground,
                        }}
                    >
                        <Icon className="w-3 h-3" style={{ color: config.color }} />
                        <span>Realtime: {config.label}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
