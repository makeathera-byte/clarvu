'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { signupWithEmail } from '@/app/auth/actions/signup';
import { signInWithGoogle } from '@/app/auth/actions/oauth';
import Link from 'next/link';

export function SignupForm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signupWithEmail(name, email, password);

            if (result.success) {
                router.push('/auth/onboarding');
                router.refresh();
            } else {
                setError(result.error || 'Signup failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setLoading(true);

        try {
            const result = await signInWithGoogle();

            if (result.success && result.url) {
                window.location.href = result.url;
            } else {
                setError(result.error || 'Google sign-up failed');
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
                <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Join Clarvu and start managing your tasks
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

            {/* Google Sign Up */}
            <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="auth-button-google w-full"
            >
                <FcGoogle className="w-5 h-5" />
                <span>Sign up with Google</span>
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

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                    <label htmlFor="name" className="auth-label">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="auth-input"
                        placeholder="John Doe"
                        disabled={loading}
                    />
                </div>

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
                        minLength={6}
                        className="auth-input"
                        placeholder="At least 6 characters"
                        disabled={loading}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Minimum 6 characters
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-button-primary w-full"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Creating account...</span>
                        </div>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-700 transition-colors">
                    Sign in
                </Link>
            </p>
        </motion.div>
    );
}
