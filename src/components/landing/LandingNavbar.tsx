'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient } from '@/lib/supabase/client';

export function LandingNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'About', href: '#about' },
        { name: 'Contact Us', href: '#contact' },
    ];

    useEffect(() => {
        // Check initial auth status
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                setIsSignedIn(!!user);
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsSignedIn(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
            setIsSignedIn(!!session?.user);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="container-padding max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <img
                            src="https://xrdxkgyynnzkbxtxoycl.supabase.co/storage/v1/object/public/logo/Transparent%20logo%201_1.png"
                            alt="Clarvu Logo"
                            className="h-10 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-gray-700 hover:text-green-700 font-medium text-sm transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {!isLoading && (
                            <>
                                <Link
                                    href="/pricing"
                                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Start Free Trial
                                </Link>
                                {isSignedIn ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-5 py-2.5 border-2 border-green-600 text-green-600 rounded-lg font-semibold text-sm hover:bg-green-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/auth/login"
                                        className="px-5 py-2.5 border-2 border-green-600 text-green-600 rounded-lg font-semibold text-sm hover:bg-green-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-700 hover:text-green-700 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-gray-200 bg-white"
                    >
                        <div className="container-padding max-w-7xl mx-auto px-4 py-4 space-y-3">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-2.5 text-gray-700 hover:text-green-700 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                            {!isLoading && (
                                <div className="pt-3 space-y-2 border-t border-gray-200">
                                    <Link
                                        href="/pricing"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2.5 text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold text-sm shadow-md"
                                    >
                                        Start Free Trial
                                    </Link>
                                    {isSignedIn ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-4 py-2.5 text-center border-2 border-green-600 text-green-600 rounded-lg font-semibold text-sm"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/auth/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-4 py-2.5 text-center border-2 border-green-600 text-green-600 rounded-lg font-semibold text-sm"
                                        >
                                            Sign In
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
