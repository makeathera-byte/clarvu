'use client';

import { useState, InputHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
    { label, error, icon: Icon, className = '', ...props },
    ref
) {
    const { currentTheme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            {label && (
                <label
                    className="block text-sm font-medium"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    {label}
                </label>
            )}

            <motion.div
                animate={{
                    boxShadow: isFocused
                        ? `0 0 0 3px ${currentTheme.colors.primary}20`
                        : 'none',
                }}
                transition={{ duration: 0.2 }}
                className="relative"
            >
                {/* Leading icon */}
                {Icon && (
                    <Icon
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none"
                        style={{
                            color: isFocused
                                ? currentTheme.colors.primary
                                : currentTheme.colors.mutedForeground
                        }}
                    />
                )}

                {/* Input field */}
                <input
                    ref={ref}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
            w-full h-12 
            ${Icon ? 'pl-12' : 'pl-4'} pr-4 
            rounded-xl 
            border-2
            outline-none
            transition-all duration-200
            ${className}
          `}
                    style={{
                        backgroundColor: currentTheme.colors.muted,
                        color: currentTheme.colors.foreground,
                        borderColor: isFocused
                            ? currentTheme.colors.primary
                            : 'transparent',
                    }}
                    {...props}
                />
            </motion.div>

            {/* Error message */}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm"
                    style={{ color: '#ef4444' }}
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
});
