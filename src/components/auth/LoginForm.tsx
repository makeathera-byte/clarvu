'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { loginWithEmail } from '@/app/auth/actions/login';
import { signInWithGoogle } from '@/app/auth/actions/oauth';
import Link from 'next/link';

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await loginWithEmail(email, password);

            if (result.success) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const result = await signInWithGoogle();

            if (result.success && result.url) {
                window.location.href = result.url;
            } else {
                setError(result.error || 'Google sign-in failed');
                setLoading(false);
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Sign in to continue to Clarvu
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-lg bg-red-50 border border-red-200"
                >
                    <p className="text-sm text-red-600">{error}</p>
                </motion.div>
            )}

            {/* Google Sign In */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="auth-button-google w-full"
            >
                <FcGoogle className="w-5 h-5" />
                <span>Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="auth-label">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="auth-input"
                        placeholder="you@example.com"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="auth-label">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="auth-input"
                        placeholder="••••••••"
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-button-primary w-full"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Signing in...</span>
                        </div>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Sign up
                </Link>
            </p>
        </motion.div>
    );
}
