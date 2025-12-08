'use client';

import { useState, InputHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
    { label = 'Password', error, className = '', ...props },
    ref
) {
    const { currentTheme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
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
                {/* Lock icon */}
                <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none"
                    style={{
                        color: isFocused
                            ? currentTheme.colors.primary
                            : currentTheme.colors.mutedForeground
                    }}
                />

                {/* Input field */}
                <input
                    ref={ref}
                    type={showPassword ? 'text' : 'password'}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
            w-full h-12 
            pl-12 pr-12 
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

                {/* Show/hide toggle button */}
                <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                    style={{ color: currentTheme.colors.mutedForeground }}
                >
                    {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </motion.button>
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
