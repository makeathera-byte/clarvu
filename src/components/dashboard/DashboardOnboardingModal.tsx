'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountrySelector } from '@/components/auth/CountrySelector';
import { ThemeSelector } from '@/components/auth/ThemeSelector';
import { saveOnboardingData } from '@/app/auth/onboarding/actions';
import { Check, ArrowRight, Sparkles, X } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useRouter } from 'next/navigation';

interface DashboardOnboardingModalProps {
    onComplete: () => void;
}

export function DashboardOnboardingModal({ onComplete }: DashboardOnboardingModalProps) {
    const router = useRouter();
    const { setTheme, currentTheme } = useTheme();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState('forest');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleThemeSelect = (themeId: string) => {
        setSelectedTheme(themeId);
        setTheme(themeId);
    };

    const handleContinue = async () => {
        if (step === 1) {
            if (!selectedCountry) {
                setError('Please select a country');
                return;
            }
            setError('');
            setStep(2);
        } else {
            setLoading(true);
            setError('');

            try {
                const result = await saveOnboardingData(selectedCountry!, selectedTheme);

                if (result.success) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    onComplete();
                    router.refresh();
                } else {
                    setError(result.error || 'Failed to save preferences');
                    setLoading(false);
                }
            } catch (err) {
                console.error('Onboarding error:', err);
                setError('An unexpected error occurred');
                setLoading(false);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
            {/* Modal Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative w-full rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border"
                style={{
                    maxWidth: step === 1 ? '650px' : '900px',
                    backgroundColor: `${currentTheme.colors.card}f5`,
                    borderColor: currentTheme.colors.border,
                    maxHeight: '90vh',
                }}
            >
                {/* Header */}
                <div
                    className="px-8 py-6 relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.accent} 100%)`
                    }}
                >
                    {/* Animated background pattern */}
                    <motion.div
                        className="absolute inset-0 bg-white/10"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%'],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: 'reverse',
                        }}
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '50px 50px',
                        }}
                    />

                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10"
                    >
                        <h2
                            className="text-3xl font-extrabold mb-2 flex items-center gap-3"
                            style={{ color: currentTheme.colors.primaryForeground }}
                        >
                            {step === 1 ? (
                                <>
                                    <Sparkles className="w-8 h-8" />
                                    Welcome to Clarvu!
                                </>
                            ) : (
                                'Choose Your Theme'
                            )}
                        </h2>
                        <p
                            className="text-base"
                            style={{ color: `${currentTheme.colors.primaryForeground}dd` }}
                        >
                            {step === 1
                                ? "Let's personalize your experience. Where are you from?"
                                : '⚡ Click any theme to preview it instantly'}
                        </p>
                    </motion.div>

                    {/* Progress dots */}
                    <div className="absolute top-6 right-6 flex gap-2 z-10">
                        <div
                            className="w-2 h-2 rounded-full transition-all duration-300"
                            style={{
                                backgroundColor: step === 1
                                    ? currentTheme.colors.primaryForeground
                                    : `${currentTheme.colors.primaryForeground}40`
                            }}
                        />
                        <div
                            className="w-2 h-2 rounded-full transition-all duration-300"
                            style={{
                                backgroundColor: step === 2
                                    ? currentTheme.colors.primaryForeground
                                    : `${currentTheme.colors.primaryForeground}40`
                            }}
                        />
                    </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-b px-8 py-4"
                            style={{
                                backgroundColor: `${currentTheme.colors.destructive}15`,
                                borderColor: `${currentTheme.colors.destructive}30`,
                            }}
                        >
                            <p className="text-sm font-semibold" style={{ color: currentTheme.colors.destructive }}>
                                {error}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content */}
                <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="country"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CountrySelector
                                    selectedCountry={selectedCountry}
                                    onSelect={setSelectedCountry}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="theme"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ThemeSelector
                                    selectedTheme={selectedTheme}
                                    onSelect={handleThemeSelect}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div
                    className="px-8 py-6 border-t flex gap-4"
                    style={{
                        backgroundColor: `${currentTheme.colors.muted}40`,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    {step === 2 && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => {
                                setStep(1);
                                setError('');
                            }}
                            disabled={loading}
                            className="px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                            style={{
                                borderColor: currentTheme.colors.border,
                                color: currentTheme.colors.foreground,
                                backgroundColor: `${currentTheme.colors.background}80`,
                            }}
                        >
                            Back
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContinue}
                        disabled={loading || (step === 1 && !selectedCountry)}
                        className="flex-1 px-8 py-3 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                        style={{
                            background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.accent} 100%)`,
                            color: currentTheme.colors.primaryForeground,
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span>{step === 1 ? 'Continue' : 'Get Started'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
