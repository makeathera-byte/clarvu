/**
 * Account Menu Component
 * 
 * Dropdown menu showing user name, trial/plan status, and logout option
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Sparkles, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface AccountMenuProps {
    userName: string;
    themeColors: {
        card: string;
        border: string;
        foreground: string;
        mutedForeground: string;
        muted: string;
        primary: string;
    };
}

export function AccountMenu({ userName, themeColors }: AccountMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [trialDays, setTrialDays] = useState<number | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch trial status
    useEffect(() => {
        async function loadTrialStatus() {
            try {
                const response = await fetch('/api/trial/status');
                if (response.ok) {
                    const data = await response.json();
                    setTrialDays(data.daysRemaining);
                }
            } catch (error) {
                console.error('Failed to load trial status:', error);
            }
        }
        loadTrialStatus();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await supabaseClient.auth.signOut();

            // Redirect to login page
            router.push('/auth/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
            setLoggingOut(false);
        }
    };

    const displayName = userName || 'User';
    const hasActiveTrial = trialDays !== null && trialDays > 0;
    const isUrgent = trialDays !== null && trialDays <= 3;

    return (
        <div className="relative" ref={menuRef}>
            {/* Account Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                    backgroundColor: themeColors.muted,
                    color: themeColors.foreground,
                }}
            >
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColors.primary }}>
                    <User className="w-4 h-4" style={{ color: 'white' }} />
                </div>
                <span className="hidden md:block text-sm font-medium">{displayName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl border overflow-hidden z-50"
                        style={{
                            backgroundColor: themeColors.card,
                            borderColor: themeColors.border,
                        }}
                    >
                        {/* User Info Section */}
                        <div className="p-4 border-b" style={{ borderColor: themeColors.border }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColors.primary }}>
                                    <User className="w-5 h-5" style={{ color: 'white' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate" style={{ color: themeColors.foreground }}>
                                        {displayName}
                                    </p>
                                    <p className="text-xs" style={{ color: themeColors.mutedForeground }}>
                                        Account
                                    </p>
                                </div>
                            </div>

                            {/* Plan/Trial Status */}
                            {hasActiveTrial ? (
                                <div
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isUrgent
                                        ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-400/25'
                                        : 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/25'
                                        }`}
                                >
                                    <Sparkles className={`w-3.5 h-3.5 ${isUrgent ? 'text-amber-500' : 'text-emerald-500'}`} />
                                    <div className="flex-1">
                                        <p className={`text-xs font-semibold ${isUrgent ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            Free Trial
                                        </p>
                                        <p className={`text-[10px] ${isUrgent ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            {trialDays} {trialDays === 1 ? 'day' : 'days'} remaining
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-3 py-2 rounded-lg bg-gray-100">
                                    <p className="text-xs font-semibold text-gray-700">Free Plan</p>
                                    <p className="text-[10px] text-gray-500">Trial expired</p>
                                </div>
                            )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {/* Settings */}
                            <Link
                                href="/settings/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-opacity-50"
                                style={{
                                    color: themeColors.foreground,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.muted}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Settings className="w-4 h-4" />
                                <span className="text-sm font-medium">Settings</span>
                            </Link>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    color: '#ef4444',
                                }}
                                onMouseEnter={(e) => !loggingOut && (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {loggingOut ? 'Logging out...' : 'Logout'}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
