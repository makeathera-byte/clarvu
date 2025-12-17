'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountrySelector } from '@/components/auth/CountrySelector';
import { ThemeSelector } from '@/components/auth/ThemeSelector';
import { saveOnboardingData } from '@/app/auth/onboarding/actions';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '@/lib/theme/ThemeContext';

export function OnboardingModal() {
    const router = useRouter();
    const { setTheme, currentTheme } = useTheme();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState('forest');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Apply theme instantly when selected
    useEffect(() => {
        if (step === 2 && selectedTheme) {
            console.log('⚡ Applying theme instantly:', selectedTheme);
            setTheme(selectedTheme);
        }
    }, [selectedTheme, step, setTheme]);

    const handleThemeSelect = (themeId: string) => {
        console.log('🎨 Theme selected:', themeId);
        setSelectedTheme(themeId);
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
                console.log('Saving onboarding data...', { selectedCountry, selectedTheme });
                const result = await saveOnboardingData(selectedCountry!, selectedTheme);
                console.log('Onboarding result:', result);

                if (result.success) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    router.push('/dashboard');
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
        <div className="min-h-screen w-full flex overflow-hidden relative">
            {/* Background with theme colors - animated */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br transition-all duration-700"
                style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.primary}20 50%, ${currentTheme.colors.accent}15 100%)`
                }}
            />

            {/* Floating background elements for visual interest */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    initial={{ left: '10%', top: '20%' }}
                />
                <motion.div
                    className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{ backgroundColor: currentTheme.colors.accent }}
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    initial={{ right: '10%', bottom: '20%' }}
                />
            </div>

            {/* Main Content Container */}
            <div className="relative z-30 w-full flex flex-col lg:flex-row">
                {/* Left Side - Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 min-h-screen">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full max-w-2xl"
                    >
                        {/* Logo */}
                        <motion.div
                            className="flex justify-center mb-8"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <Image
                                src="https://xrdxkgyynnzkbxtxoycl.supabase.co/storage/v1/object/public/logo/Transparent%20logo%201_1.png"
                                alt="Clarvu Logo"
                                width={180}
                                height={52}
                                priority
                            />
                        </motion.div>

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center mb-10">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="flex flex-col items-center"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div
                                        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-500 ${step >= 1
                                            ? 'shadow-2xl'
                                            : 'bg-gray-200 text-gray-500'
                                            }`}
                                        style={{
                                            backgroundColor: step >= 1 ? currentTheme.colors.primary : undefined,
                                            color: step >= 1 ? currentTheme.colors.primaryForeground : undefined,
                                        }}
                                    >
                                        {step > 1 ? <Check className="w-7 h-7" /> : '1'}
                                    </div>
                                    <span className="text-sm font-semibold mt-2" style={{ color: currentTheme.colors.foreground }}>
                                        Country
                                    </span>
                                </motion.div>

                                <motion.div
                                    className="h-1 w-20 lg:w-32 rounded-full transition-all duration-500"
                                    style={{
                                        backgroundColor: step >= 2 ? currentTheme.colors.primary : currentTheme.colors.muted
                                    }}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.4 }}
                                />

                                <motion.div
                                    className="flex flex-col items-center"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div
                                        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-500 ${step >= 2
                                            ? 'shadow-2xl'
                                            : 'bg-gray-200 text-gray-500'
                                            }`}
                                        style={{
                                            backgroundColor: step >= 2 ? currentTheme.colors.primary : undefined,
                                            color: step >= 2 ? currentTheme.colors.primaryForeground : undefined,
                                        }}
                                    >
                                        2
                                    </div>
                                    <span className="text-sm font-semibold mt-2" style={{ color: currentTheme.colors.foreground }}>
                                        Theme
                                    </span>
                                </motion.div>
                            </div>
                        </div>

                        {/* Main Card with Glassmorphism */}
                        <motion.div
                            className="rounded-3xl shadow-2xl backdrop-blur-xl border overflow-hidden"
                            style={{
                                backgroundColor: `${currentTheme.colors.card}dd`,
                                borderColor: currentTheme.colors.border,
                            }}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            {/* Header */}
                            <div
                                className="px-8 py-6 relative overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.accent} 100%)`
                                }}
                            >
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
                                <motion.h1
                                    key={step}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl lg:text-5xl font-extrabold mb-3 relative z-10 flex items-center gap-3"
                                    style={{ color: currentTheme.colors.primaryForeground }}
                                >
                                    {step === 1 ? (
                                        <>
                                            <Sparkles className="w-10 h-10" />
                                            Welcome to Clarvu!
                                        </>
                                    ) : (
                                        'Choose Your Vibe'
                                    )}
                                </motion.h1>
                                <motion.p
                                    key={`desc-${step}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-lg relative z-10"
                                    style={{ color: `${currentTheme.colors.primaryForeground}dd` }}
                                >
                                    {step === 1
                                        ? "Let's personalize your experience. Where are you from?"
                                        : '⚡ Themes apply instantly - click to preview'}
                                </motion.p>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/10 border-b"
                                        style={{ borderColor: currentTheme.colors.destructive + '30' }}
                                    >
                                        <div className="px-8 py-4">
                                            <p className="text-sm font-semibold" style={{ color: currentTheme.colors.destructive }}>
                                                {error}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Content */}
                            <div className="p-8 min-h-[450px] flex items-center">
                                <AnimatePresence mode="wait">
                                    {step === 1 ? (
                                        <motion.div
                                            key="country"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.4 }}
                                            className="w-full"
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
                                            transition={{ duration: 0.4 }}
                                            className="w-full"
                                        >
                                            <ThemeSelector
                                                selectedTheme={selectedTheme}
                                                onSelect={handleThemeSelect}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer / Actions */}
                            <div
                                className="px-8 py-6 border-t flex gap-4"
                                style={{
                                    backgroundColor: currentTheme.colors.muted + '40',
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
                                        className="px-6 py-4 rounded-xl border-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                        style={{
                                            borderColor: currentTheme.colors.border,
                                            color: currentTheme.colors.foreground,
                                            backgroundColor: currentTheme.colors.background + '80',
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
                                    className="flex-1 px-8 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                    style={{
                                        background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.accent} 100%)`,
                                        color: currentTheme.colors.primaryForeground,
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{step === 1 ? 'Continue' : 'Get Started'}</span>
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Helper Text */}
                        <motion.p
                            className="text-center text-sm mt-6 font-medium"
                            style={{ color: currentTheme.colors.mutedForeground }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            {step === 1 ? 'Step 1 of 2 - Quick setup' : 'Almost there! Choose your favorite theme'}
                        </motion.p>
                    </motion.div>
                </div>

                {/* Right Side - Visual Preview */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Theme preview with wallpaper */}
                        <motion.div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: currentTheme.wallpaper ? `url(${currentTheme.wallpaper})` : 'none',
                                backgroundColor: currentTheme.colors.background,
                            }}
                            key={currentTheme.id}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7 }}
                        />

                        {/* Gradient overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(135deg, ${currentTheme.colors.primary}40 0%, ${currentTheme.colors.accent}30 100%)`
                            }}
                        />

                        {/* Theme info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-12">
                            <motion.div
                                className="backdrop-blur-xl rounded-2xl p-8 border"
                                style={{
                                    backgroundColor: `${currentTheme.colors.card}dd`,
                                    borderColor: currentTheme.colors.border,
                                }}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                <h3
                                    className="text-3xl font-bold mb-2"
                                    style={{ color: currentTheme.colors.foreground }}
                                >
                                    {currentTheme.name}
                                </h3>
                                <p
                                    className="text-lg mb-4"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {currentTheme.description}
                                </p>
                                <div className="flex gap-3">
                                    {Object.entries(currentTheme.tiles || {}).slice(0, 5).map(([key, color]) => (
                                        <motion.div
                                            key={key}
                                            className="w-12 h-12 rounded-lg shadow-lg"
                                            style={{ backgroundColor: color }}
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ type: 'spring', stiffness: 400 }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
