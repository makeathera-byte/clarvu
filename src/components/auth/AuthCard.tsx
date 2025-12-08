'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';

interface AuthCardProps {
    children: ReactNode;
    className?: string;
}

export function AuthCard({ children, className = '' }: AuthCardProps) {
    const { currentTheme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`
        w-full max-w-md
        p-8 sm:p-10
        rounded-3xl
        backdrop-blur-2xl
        border
        shadow-2xl
        ${className}
      `}
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
                boxShadow: `
          0 25px 50px -12px ${currentTheme.colors.background}90,
          0 0 0 1px ${currentTheme.colors.border},
          inset 0 1px 0 ${currentTheme.colors.accent}10
        `,
            }}
        >
            {children}
        </motion.div>
    );
}
