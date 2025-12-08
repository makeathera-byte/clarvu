'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Shield } from 'lucide-react';

export function AdminHeader() {
    const { currentTheme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="flex items-center gap-3 mb-2">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, #ef4444, #b91c1c)`,
                    }}
                >
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Admin Panel
                    </h1>
                    <p
                        className="text-sm"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        System overview and user management
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
