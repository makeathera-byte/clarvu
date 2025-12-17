'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CountrySelector } from '@/components/auth/CountrySelector';
import { ThemeSelector } from '@/components/auth/ThemeSelector';
import { saveOnboardingData } from '@/app/auth/onboarding/actions';
import { useRouter } from 'next/navigation';

export function OnboardingModal() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState('forest');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                    router.push('/dashboard');
                    router.refresh();
                } else {
                    setError(result.error || 'Failed to save preferences');
                    setLoading(false);
                }
            } catch (err) {
                setError('An unexpected error occurred');
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {step === 1 ? 'Where are you from?' : 'Choose your theme'}
                    </h1>
                    <p className="text-gray-600">
                        {step === 1
                            ? 'Select your country to get started'
                            : 'Pick a theme that matches your style'}
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex gap-2 mb-8">
                    <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`} />
                    <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-lg bg-red-50 border border-red-200 mb-6"
                    >
                        <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                )}

                {/* Content Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                    {step === 1 ? (
                        <CountrySelector
                            selectedCountry={selectedCountry}
                            onSelect={setSelectedCountry}
                        />
                    ) : (
                        <ThemeSelector
                            selectedTheme={selectedTheme}
                            onSelect={setSelectedTheme}
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            disabled={loading}
                            className="px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleContinue}
                        disabled={loading || (step === 1 && !selectedCountry)}
                        className="flex-1 auth-button-primary disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : (
                            step === 1 ? 'Continue' : 'Get Started'
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
