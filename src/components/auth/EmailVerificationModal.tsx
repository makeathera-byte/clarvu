'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
}

export function EmailVerificationModal({ isOpen, onClose, email }: EmailVerificationModalProps) {
    const { currentTheme } = useTheme();
    const router = useRouter();

    const handleOkay = () => {
        onClose();
        router.push('/auth/login?signup=success');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={handleOkay}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-sm rounded-2xl border p-6 text-center"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    {/* Icon */}
                    <div
                        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                        style={{
                            background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                        }}
                    >
                        <Mail className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h2
                        className="text-xl font-bold mb-2"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Verify Your Email
                    </h2>

                    {/* Body */}
                    <p
                        className="text-sm mb-6"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        We&apos;ve sent a verification link to <strong>{email}</strong>.
                        Check your inbox to verify your account.
                    </p>

                    {/* Success indicator */}
                    <div
                        className="flex items-center justify-center gap-2 text-sm mb-6 p-3 rounded-xl"
                        style={{
                            backgroundColor: `${currentTheme.colors.primary}15`,
                            color: currentTheme.colors.primary,
                        }}
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span>Account created successfully</span>
                    </div>

                    {/* Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={handleOkay}
                            className="w-full h-12 rounded-xl font-medium"
                            style={{
                                backgroundColor: currentTheme.colors.primary,
                                color: currentTheme.colors.primaryForeground,
                            }}
                        >
                            Okay
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
