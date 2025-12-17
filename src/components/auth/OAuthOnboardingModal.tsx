/**
 * OAuth Onboarding Modal
 * 
 * Prompts OAuth users to select country and timezone
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, X } from 'lucide-react';
import { completeOnboarding } from '@/app/auth/onboarding/actions';
import { useRouter } from 'next/navigation';
import type { Country } from '@/lib/utils/countries';

export function OAuthOnboardingModal() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load countries on mount
    useEffect(() => {
        import('@/lib/utils/countries').then(({ countries: countryList, getDefaultCountry }) => {
            setCountries(countryList);
            try {
                setSelectedCountry(getDefaultCountry());
            } catch (e) {
                if (countryList.length > 0) {
                    setSelectedCountry(countryList[0]);
                }
            }
        });
    }, []);

    const handleComplete = async () => {
        if (!selectedCountry) {
            setError('Please select a country');
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await completeOnboarding({
            country: selectedCountry.code,
            timezone: selectedCountry.timezone,
        });

        if (result.success) {
            setIsOpen(false);
            router.refresh(); // Refresh to update profile data
        } else {
            setError(result.error || 'Failed to complete setup');
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Complete Your Profile
                                    </h2>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6">
                                To get started, please select your country. This helps us set the correct timezone for your tasks.
                            </p>

                            {/* Error */}
                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Country Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                </label>
                                <select
                                    value={selectedCountry?.code || ''}
                                    onChange={(e) => {
                                        const country = countries.find(c => c.code === e.target.value);
                                        if (country) setSelectedCountry(country);
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                                    disabled={isLoading}
                                >
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.flag} {country.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedCountry && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Timezone: {selectedCountry.timezone}
                                    </p>
                                )}
                            </div>

                            {/* Continue Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleComplete}
                                disabled={isLoading || !selectedCountry}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Continue to Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>

                            <p className="mt-4 text-xs text-center text-gray-500">
                                You can change this later in settings
                            </p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
