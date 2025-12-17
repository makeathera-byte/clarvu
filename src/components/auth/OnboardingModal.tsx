'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountrySelector } from '@/components/auth/CountrySelector';
import { ThemeSelector } from '@/components/auth/ThemeSelector';
import { saveOnboardingData } from '@/app/auth/onboarding/actions';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '@/lib/theme/ThemeContext';

export function OnboardingModal() {
    const router = useRouter();
    const { setTheme } = useTheme();
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
        // Theme will be applied instantly via useEffect above
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
                    // Small delay to show success state
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
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl"
            >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Image
                        src="https://xrdxkgyynnzkbxtxoycl.supabase.co/storage/v1/object/public/logo/Transparent%20logo%201_1.png"
                        alt="Clarvu Logo"
                        width={140}
                        height={40}
                        priority
                    />
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-4">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= 1
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > 1 ? <Check className="w-6 h-6" /> : '1'}
                            </div>
                            <span className="text-sm font-medium text-gray-700 mt-2">Country</span>
                        </div>

                        {/* Connector */}
                        <div className={`h-1 w-24 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />

                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= 2
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                2
                            </div>
                            <span className="text-sm font-medium text-gray-700 mt-2">Theme</span>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <motion.div
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                    layout
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-5 text-white">
                        <motion.h1
                            key={step}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold mb-2"
                        >
                            {step === 1 ? 'Welcome to Clarvu!' : 'Choose Your Workspace Theme'}
                        </motion.h1>
                        <motion.p
                            key={`desc-${step}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-green-100"
                        >
                            {step === 1
                                ? "Let's get to know you better. Where are you from?"
                                : '⚡ Themes apply instantly - click to preview your workspace'}
                        </motion.p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 border-b border-red-100"
                            >
                                <div className="px-8 py-4">
                                    <p className="text-sm text-red-600 font-medium">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content */}
                    <div className="p-8" style={{ minHeight: '400px' }}>
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="country"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
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
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
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

                    {/* Footer / Actions */}
                    <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-4">
                        {step === 2 && (
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setError('');
                                }}
                                disabled={loading}
                                className="px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleContinue}
                            disabled={loading || (step === 1 && !selectedCountry)}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span>{step === 1 ? 'Continue' : 'Get Started'}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Helper Text */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    {step === 1 ? 'Step 1 of 2' : 'Almost there! One more step'}
                </p>
            </motion.div>
        </div>
    );
}
