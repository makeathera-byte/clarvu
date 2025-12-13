'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthThemeSelector } from '@/components/auth/AuthThemeSelector';
import { EmailVerificationModal } from '@/components/auth/EmailVerificationModal';
import { CountrySelector } from '@/components/auth/CountrySelector';
import { Button } from '@/components/ui/button';
import { User, Mail, ArrowRight, ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import { signUpAction } from './actions';
import type { Country } from '@/lib/utils/countries';
import { supabaseClient } from '@/lib/supabase/client';
import { GoogleIcon } from '@/components/auth/GoogleIcon';

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    country?: string;
    theme?: string;
    general?: string;
}

export default function SignupPage() {
    const themeContext = useTheme();
    const currentTheme = themeContext?.currentTheme || {
        id: 'minimal',
        colors: {
            primary: '#18181b',
            primaryForeground: '#fafafa',
            accent: '#71717a',
            accentForeground: '#fafafa',
            background: '#ffffff',
            foreground: '#18181b',
            card: 'rgba(250, 250, 250, 0.9)',
            cardForeground: '#18181b',
            muted: '#f4f4f5',
            mutedForeground: '#71717a',
            border: 'rgba(0, 0, 0, 0.08)',
        },
        isDark: false,
    };
    const setTheme = themeContext?.setTheme || (() => {});
    
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedTheme, setSelectedTheme] = useState(currentTheme.id || 'minimal');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [countriesList, setCountriesList] = useState<Country[]>([]);
    const [mounted, setMounted] = useState(false);

    // Mark as mounted to prevent hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Load countries and auto-detect country on mount (client-side only)
    useEffect(() => {
        if (!mounted) return;
        
        // Dynamically import to avoid SSR issues
        import('@/lib/utils/countries').then(({ countries, getDefaultCountry }) => {
            setCountriesList(countries);
            try {
                setSelectedCountry(getDefaultCountry());
            } catch (error) {
                console.error('Error getting default country:', error);
                // Fallback to first country if there's an error
                if (countries.length > 0) {
                    setSelectedCountry(countries[0]);
                }
            }
        }).catch((error) => {
            console.error('Error loading countries:', error);
        });
    }, [mounted]);

    // Handle theme selection
    const handleThemeSelect = useCallback((themeId: string) => {
        setSelectedTheme(themeId);
        setTheme(themeId);
        setErrors(prev => ({ ...prev, theme: undefined }));
    }, [setTheme]);

    // Handle country selection
    const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = countriesList.find(c => c.code === e.target.value);
        if (country) {
            setSelectedCountry(country);
            setErrors(prev => ({ ...prev, country: undefined }));
        }
    }, [countriesList]);

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
        } catch (error) {
            console.error('Signup error:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : undefined,
                error: error,
            });
            const errorMessage = error instanceof Error 
                ? error.message 
                : typeof error === 'string' 
                    ? error 
                    : JSON.stringify(error);
            setErrors({ general: errorMessage || 'An unexpected error occurred' });
            setIsLoading(false);
        }
    }, [validateForm, fullName, email, password, selectedTheme, selectedCountry]);

    const handleGoogleSignIn = useCallback(async () => {
        setIsLoading(true);
        setErrors({});

        try {
            const redirectTo = `${window.location.origin}/auth/callback`;
            const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                },
            });

            if (oauthError) {
                setErrors({ general: oauthError.message || 'Google sign-in failed' });
                setIsLoading(false);
            }
            // If successful, the user will be redirected to Google, then to /auth/callback
        } catch (err) {
            console.error('Google sign-in error:', err);
            setErrors({ general: 'An unexpected error occurred' });
            setIsLoading(false);
        }
    }, []);

    // Prevent rendering until mounted to avoid hydration issues
    if (!mounted) {
        return (
            <div className="relative w-full max-w-lg flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

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
                        <span className="text-2xl font-bold text-white relative z-10">C</span>
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
                            {countriesList.length > 0 ? (
                                <CountrySelector
                                    countries={countriesList}
                                    selectedCountry={selectedCountry}
                                    onSelect={(country) => {
                                        setSelectedCountry(country);
                                        setErrors(prev => ({ ...prev, country: undefined }));
                                    }}
                                    error={errors.country}
                                    currentTheme={currentTheme}
                                />
                            ) : (
                                <div className="w-full h-12 px-4 rounded-xl border-2 flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.muted, color: currentTheme.colors.mutedForeground }}>
                                    Loading countries...
                                </div>
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

                        {/* Divider */}
                        <div className="flex items-center gap-4 pt-2">
                            <div
                                className="flex-1 h-px"
                                style={{ backgroundColor: currentTheme.colors.border }}
                            />
                            <span
                                className="text-xs uppercase tracking-wider"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                or
                            </span>
                            <div
                                className="flex-1 h-px"
                                style={{ backgroundColor: currentTheme.colors.border }}
                            />
                        </div>

                        {/* Google Sign In Button */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl text-base font-medium flex items-center justify-center gap-3 border-2"
                                style={{
                                    backgroundColor: currentTheme.colors.background,
                                    color: currentTheme.colors.foreground,
                                    borderColor: currentTheme.colors.border,
                                }}
                            >
                                <GoogleIcon className="w-5 h-5" />
                                Continue with Google
                            </Button>
                        </motion.div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 pt-2">
                            <div
                                className="flex-1 h-px"
                                style={{ backgroundColor: currentTheme.colors.border }}
                            />
                            <span
                                className="text-xs uppercase tracking-wider"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                or
                            </span>
                            <div
                                className="flex-1 h-px"
                                style={{ backgroundColor: currentTheme.colors.border }}
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
