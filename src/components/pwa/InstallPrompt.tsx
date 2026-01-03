'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BeforeInstallPromptEvent } from '@/types/pwa';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone ||
                document.referrer.includes('android-app://');

            setIsInstalled(isStandalone);

            // Check if user previously dismissed the prompt
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed && !isStandalone) {
                setShowPrompt(true);
            }
        };

        checkInstalled();

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);
            setIsInstallable(true);
            console.log('[PWA] Install prompt available');
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            console.log('[PWA] App installed');
            setIsInstalled(true);
            setIsInstallable(false);
            setShowPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            console.warn('[PWA] No install prompt available');
            return;
        }

        try {
            // Show the install prompt
            await deferredPrompt.prompt();

            // Wait for the user's response
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`[PWA] User ${outcome} the install prompt`);

            if (outcome === 'accepted') {
                setIsInstalled(true);
            }

            // Clear the deferred prompt
            setDeferredPrompt(null);
            setIsInstallable(false);
            setShowPrompt(false);
        } catch (error) {
            console.error('[PWA] Install prompt error:', error);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Don't show anything if already installed or not installable
    if (isInstalled || !isInstallable) {
        return null;
    }

    return (
        <>
            {/* Inline Install Button (for navbar/menu integration) */}
            <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors w-full"
                title="Install Clarvu as a desktop app"
            >
                <Download className="w-4 h-4" />
                <span>Install App</span>
            </button>

            {/* Subtle Banner Prompt */}
            <AnimatePresence>
                {showPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
                    >
                        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Download className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-foreground mb-1">
                                        Install Clarvu
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Install Clarvu like a desktop app — no App Store, no friction.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleInstallClick}
                                            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                                        >
                                            Install
                                        </button>
                                        <button
                                            onClick={handleDismiss}
                                            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Not now
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Dismiss"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Standalone install button for use anywhere
export function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone;
            setIsInstalled(isStandalone);
        };

        checkInstalled();

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
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

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setIsInstalled(true);
            }

            setDeferredPrompt(null);
            setIsInstallable(false);
        } catch (error) {
            console.error('[PWA] Install error:', error);
        }
    };

    if (isInstalled || !isInstallable) {
        return null;
    }

    return (
        <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
        >
            <Download className="w-4 h-4" />
            Install Clarvu
        </button>
    );
}
