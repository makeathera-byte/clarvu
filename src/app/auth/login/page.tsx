'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { loginAction } from './actions';
import { supabaseClient } from '@/lib/supabase/client';
import { GoogleIcon } from '@/components/auth/GoogleIcon';

// Generate random tile positions
function generateTiles(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        initialX: (Math.random() - 0.5) * 2000,
        initialY: (Math.random() - 0.5) * 2000,
        initialRotation: Math.random() * 720 - 360,
        initialScale: Math.random() * 0.5 + 0.3,
        delay: Math.random() * 0.3,
    }));
}

function LoginContent() {
    const searchParams = useSearchParams();
    const { currentTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [tiles, setTiles] = useState<ReturnType<typeof generateTiles>>([]);
    const [animationPhase, setAnimationPhase] = useState<'tiles' | 'assembling' | 'form'>('tiles');

    // Check for signup success message
    const signupSuccess = searchParams.get('signup') === 'success';

    // Initialize tiles on mount
    useEffect(() => {
        setTiles(generateTiles(30));

        // Start animation sequence
        const timer1 = setTimeout(() => setAnimationPhase('assembling'), 100);
        const timer2 = setTimeout(() => {
            setAnimationPhase('form');
            setShowForm(true);
        }, 1100);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const tileColors = [
        currentTheme.tiles.tile1,
        currentTheme.tiles.tile2,
        currentTheme.tiles.tile3,
        currentTheme.tiles.tile4,
        currentTheme.tiles.tile5,
    ];

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await loginAction({ email, password });

            if (!result.success) {
                setError(result.error || 'Login failed');
                setIsLoading(false);
            }
            // If success, the action will redirect to /dashboard
            // Note: redirect() throws an error in Next.js, which is expected behavior
        } catch (error) {
            // Check if this is a redirect error (expected behavior in Next.js)
            if (error && typeof error === 'object' && 'digest' in error) {
                const redirectError = error as { digest?: string };
                if (redirectError.digest?.includes('NEXT_REDIRECT')) {
                    // This is a redirect, don't treat it as an error
                    return;
                }
            }
            
            console.error('Login error:', error);
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
                    : 'An unexpected error occurred';
            setError(errorMessage);
            setIsLoading(false);
        }
    }, [email, password]);

    const handleGoogleSignIn = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const redirectTo = `${window.location.origin}/auth/callback`;
            const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                },
            });

            if (oauthError) {
                setError(oauthError.message || 'Google sign-in failed');
                setIsLoading(false);
            }
            // If successful, the user will be redirected to Google, then to /auth/callback
        } catch (err) {
            console.error('Google sign-in error:', err);
            setError('An unexpected error occurred');
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="relative w-full max-w-md">
            {/* Tile assembly animation */}
            <AnimatePresence>
                {animationPhase !== 'form' && (
                    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
                        {tiles.map((tile) => (
                            <motion.div
                                key={tile.id}
                                initial={{
                                    x: tile.initialX,
                                    y: tile.initialY,
                                    rotate: tile.initialRotation,
                                    scale: tile.initialScale,
                                    opacity: 0,
                                }}
                                animate={animationPhase === 'assembling' ? {
                                    x: 0,
                                    y: 0,
                                    rotate: 0,
                                    scale: 1,
                                    opacity: [0, 1, 1, 0.6, 0],
                                } : {}}
                                transition={{
                                    type: 'spring',
                                    damping: 25,
                                    stiffness: 120,
                                    delay: tile.delay,
                                    opacity: {
                                        times: [0, 0.2, 0.5, 0.8, 1],
                                        duration: 1.0,
                                    },
                                }}
                                className="absolute left-1/2 top-1/2 w-16 h-16 -ml-8 -mt-8 rounded-2xl"
                                style={{
                                    backgroundColor: tileColors[tile.id % tileColors.length],
                                    backdropFilter: 'blur(8px)',
                                    border: `1px solid ${currentTheme.colors.border}`,
                                    boxShadow: `0 8px 32px ${currentTheme.colors.primary}20`,
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Login form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        {/* Logo */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
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
                                Welcome back
                            </h1>
                            <p style={{ color: currentTheme.colors.mutedForeground }}>
                                Sign in to continue your flow
                            </p>
                        </motion.div>

                        <AuthCard>
                            {/* Success message */}
                            {signupSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 rounded-xl flex items-center gap-2"
                                    style={{
                                        backgroundColor: `${currentTheme.colors.primary}15`,
                                        border: `1px solid ${currentTheme.colors.primary}30`,
                                    }}
                                >
                                    <CheckCircle className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                                    <span className="text-sm" style={{ color: currentTheme.colors.primary }}>
                                        Account created! Please sign in.
                                    </span>
                                </motion.div>
                            )}

                            {/* Error message */}
                            {error && (
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
                                        {error}
                                    </span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <AuthInput
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    icon={Mail}
                                    required
                                />

                                <PasswordInput
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />

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
                                                Sign In
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
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

                                {/* Sign up link */}
                                <p
                                    className="text-center text-sm"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    Don&apos;t have an account?{' '}
                                    <Link
                                        href="/auth/signup"
                                        className="font-medium hover:underline inline-flex items-center gap-1"
                                        style={{ color: currentTheme.colors.primary }}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Create one
                                    </Link>
                                </p>
                            </form>
                        </AuthCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="w-full max-w-md" />}>
            <LoginContent />
        </Suspense>
    );
}
