'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Check, Chrome, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import { InstallButton } from '@/components/pwa';
import type { BeforeInstallPromptEvent } from '@/types/pwa';

export function DownloadClient() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [email, setEmail] = useState('');
    const [emailSubmitted, setEmailSubmitted] = useState(false);

    useEffect(() => {
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone;
            setIsInstalled(isStandalone);
        };

        checkInstalled();

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement email submission to waitlist
        console.log('Waitlist email:', email);
        setEmailSubmitted(true);
        setEmail('');
    };

    const installSteps = [
        {
            number: 1,
            title: 'Open in Chrome or Edge',
            description: 'Visit Clarvu in a supported browser on your desktop',
        },
        {
            number: 2,
            title: 'Click Install',
            description: 'Look for the install icon in your address bar or use the button below',
        },
        {
            number: 3,
            title: 'Launch & Use',
            description: 'Clarvu will open as a native desktop app — no browser UI',
        },
    ];

    const benefits = [
        {
            icon: Zap,
            title: 'Instant Updates',
            description: 'Always get the latest features automatically',
        },
        {
            icon: Shield,
            title: 'No App Store',
            description: 'Install directly from your browser, no friction',
        },
        {
            icon: Globe,
            title: 'Works Everywhere',
            description: 'Access from any device with your session synced',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-40 px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="text-xl font-bold text-foreground">
                        Clarvu
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </nav>

            <div className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            <Download className="w-4 h-4" />
                            Desktop App Available
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                            Install Clarvu on
                            <br />
                            <span className="text-primary">your desktop</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Install Clarvu like a desktop app — no App Store, no friction.
                        </p>
                    </motion.div>

                    {/* Browser Install Section (Recommended) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-16"
                    >
                        <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Chrome className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        Install from Browser
                                    </h2>
                                    <p className="text-sm text-primary font-medium">Recommended</p>
                                </div>
                            </div>

                            <p className="text-muted-foreground mb-8">
                                The fastest way to get Clarvu on your desktop. Works in Chrome, Edge, and other Chromium-based browsers.
                            </p>

                            {/* Install Status */}
                            {isInstalled ? (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-8">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <Check className="w-5 h-5" />
                                        <span className="font-medium">Clarvu is already installed!</span>
                                    </div>
                                </div>
                            ) : isInstallable ? (
                                <div className="mb-8">
                                    <InstallButton />
                                </div>
                            ) : (
                                <div className="p-4 bg-muted/50 border border-border rounded-xl mb-8">
                                    <p className="text-sm text-muted-foreground">
                                        Installation is available in Chrome or Edge on desktop. Open this page in a supported browser to install.
                                    </p>
                                </div>
                            )}

                            {/* Installation Steps */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground mb-4">
                                    How to Install
                                </h3>
                                {installSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-4 p-4 bg-muted/30 rounded-xl"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                                            {step.number}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">
                                                {step.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Benefits Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                            Why Install?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <div
                                        key={index}
                                        className="p-6 bg-card border border-border rounded-xl"
                                    >
                                        <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {benefit.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Native Apps Section (Coming Soon) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
                            <h2 className="text-2xl font-bold text-foreground mb-4">
                                Native Desktop Apps
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                We're working on native apps for macOS, Windows, and Linux. Join the waitlist to be notified when they're ready.
                            </p>

                            {/* Platform Badges */}
                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className="px-6 py-3 bg-muted/50 border border-border rounded-lg opacity-50 cursor-not-allowed">
                                    <span className="font-medium text-foreground">macOS</span>
                                    <span className="ml-2 text-xs text-muted-foreground">Coming Soon</span>
                                </div>
                                <div className="px-6 py-3 bg-muted/50 border border-border rounded-lg opacity-50 cursor-not-allowed">
                                    <span className="font-medium text-foreground">Windows</span>
                                    <span className="ml-2 text-xs text-muted-foreground">Coming Soon</span>
                                </div>
                                <div className="px-6 py-3 bg-muted/50 border border-border rounded-lg opacity-50 cursor-not-allowed">
                                    <span className="font-medium text-foreground">Linux</span>
                                    <span className="ml-2 text-xs text-muted-foreground">Coming Soon</span>
                                </div>
                            </div>

                            {/* Email Waitlist Form */}
                            {emailSubmitted ? (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <Check className="w-5 h-5" />
                                        <span className="font-medium">Thanks! We'll notify you when native apps are ready.</span>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleEmailSubmit} className="flex gap-3 max-w-md">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                                    >
                                        Join Waitlist
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
