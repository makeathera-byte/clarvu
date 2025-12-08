'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthThemeSelector } from '@/components/auth/AuthThemeSelector';
import { EmailVerificationModal } from '@/components/auth/EmailVerificationModal';
import { Button } from '@/components/ui/button';
import { User, Mail, ArrowRight, ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { signUpAction } from './actions';
import { countries, getDefaultCountry, type Country } from '@/lib/utils/countries';

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    country?: string;
    theme?: string;
    general?: string;
}

export default function SignupPage() {
    const { currentTheme, setTheme } = useTheme();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedTheme, setSelectedTheme] = useState(currentTheme.id);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Auto-detect country on mount
    useEffect(() => {
        setSelectedCountry(getDefaultCountry());
    }, []);

    // Handle theme selection
    const handleThemeSelect = useCallback((themeId: string) => {
        setSelectedTheme(themeId);
        setTheme(themeId);
        setErrors(prev => ({ ...prev, theme: undefined }));
    }, [setTheme]);

    // Handle country selection
    const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = countries.find(c => c.code === e.target.value);
        if (country) {
            setSelectedCountry(country);
            setErrors(prev => ({ ...prev, country: undefined }));
        }
    }, []);

    // Validate form
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Please enter your name';
        }

        if (!email.trim()) {
            newErrors.email = 'Please enter your email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Please enter a password';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!selectedCountry) {
            newErrors.country = 'Please select your country';
        }

        if (!selectedTheme) {
            newErrors.theme = 'Please select a theme';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [fullName, email, password, selectedCountry, selectedTheme]);

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const result = await signUpAction({
                fullName,
                email,
                password,
                themeName: selectedTheme,
                country: selectedCountry?.code || '',
                timezone: selectedCountry?.timezone || 'UTC',
            });

            if (!result.success) {
                setErrors({ general: result.error || 'Signup failed' });
                setIsLoading(false);
            } else {
                // Show verification modal instead of redirecting
                setShowVerificationModal(true);
                setIsLoading(false);
            }
        } catch {
            setErrors({ general: 'An unexpected error occurred' });
            setIsLoading(false);
        }
    }, [validateForm, fullName, email, password, selectedTheme, selectedCountry]);

    return (
        <>
            <div className="relative w-full max-w-lg">
                {/* Logo & Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <div
                        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                            boxShadow: `0 8px 32px ${currentTheme.colors.primary}40`,
                        }}
                    >
                        <Image
                            src="/clarvu-logo.svg"
                            alt="Clarvu Logo"
                            width={64}
                            height={64}
                            className="relative z-10"
                            priority
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: `conic-gradient(from 0deg, transparent, ${currentTheme.colors.accent}, transparent)`,
                            }}
                        />
                    </div>
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Create your account
                    </h1>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        Start your productivity journey
                    </p>
                </motion.div>

                <AuthCard className="max-w-lg">
                    {/* General error message */}
                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 rounded-xl"
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                            }}
                        >
                            <span className="text-sm" style={{ color: '#ef4444' }}>
                                {errors.general}
                            </span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <AuthInput
                            label="Full Name"
                            type="text"
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                                setErrors(prev => ({ ...prev, fullName: undefined }));
                            }}
                            placeholder="Your name"
                            icon={User}
                            error={errors.fullName}
                        />

                        {/* Email */}
                        <AuthInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors(prev => ({ ...prev, email: undefined }));
                            }}
                            placeholder="you@example.com"
                            icon={Mail}
                            error={errors.email}
                        />

                        {/* Password */}
                        <PasswordInput
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors(prev => ({ ...prev, password: undefined }));
                            }}
                            placeholder="Create a password (min 6 chars)"
                            error={errors.password}
                        />

                        {/* Country Selection */}
                        <div className="space-y-2">
                            <label
                                className="flex items-center gap-2 text-sm font-medium"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                <Globe className="w-4 h-4" />
                                Country
                            </label>
                            <select
                                value={selectedCountry?.code || ''}
                                onChange={handleCountryChange}
                                className="w-full h-12 px-4 rounded-xl border-2 outline-none transition-all"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                    borderColor: errors.country ? '#ef4444' : 'transparent',
                                }}
                            >
                                <option value="">Select your country</option>
                                {countries.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            {selectedCountry && (
                                <p
                                    className="text-xs"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    Timezone: {selectedCountry.timezone}
                                </p>
                            )}
                            {errors.country && (
                                <p className="text-xs" style={{ color: '#ef4444' }}>
                                    {errors.country}
                                </p>
                            )}
                        </div>

                        {/* Theme Selection */}
                        <div className="pt-2">
                            <AuthThemeSelector
                                selectedThemeId={selectedTheme}
                                onSelect={handleThemeSelect}
                                error={errors.theme}
                            />
                        </div>

                        {/* Submit button */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="pt-2"
                        >
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl text-base font-medium flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    color: currentTheme.colors.primaryForeground,
                                    boxShadow: `0 8px 25px ${currentTheme.colors.primary}40`,
                                }}
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </motion.div>

                        {/* Login link */}
                        <div className="flex items-center justify-center pt-2">
                            <Link
                                href="/auth/login"
                                className="text-sm font-medium flex items-center gap-2 hover:underline"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Already have an account? <span style={{ color: currentTheme.colors.primary }}>Sign in</span>
                            </Link>
                        </div>
                    </form>
                </AuthCard>
            </div>

            {/* Email Verification Modal */}
            <EmailVerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                email={email}
            />
        </>
    );
}
