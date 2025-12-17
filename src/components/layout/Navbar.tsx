'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { LayoutDashboard, Timer, Settings, LogOut, Menu, X, BarChart3, Sparkles, Shield, Target } from 'lucide-react';
import { NotificationBadge } from '@/components/notifications';
import { ConnectionStatusIndicator } from '@/components/realtime';
import { Logo } from '@/components/layout/Logo';
import { AccountMenu } from '@/components/navbar/AccountMenu';

interface NavbarProps {
    isAdmin?: boolean;
    userName?: string;
}

const getNavItems = (isAdmin: boolean) => [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/routine', label: 'Routine', icon: Sparkles },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/timer', label: 'Timer', icon: Timer },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/settings/theme', label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ href: '/ppadminpp', label: 'Admin', icon: Shield }] : []),
];

export function Navbar({ isAdmin = false, userName = 'User' }: NavbarProps) {
    const pathname = usePathname();
    const { currentTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = getNavItems(isAdmin);

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-40 px-4 py-4"
        >
            <div className="max-w-6xl mx-auto">
                <div
                    className="flex items-center justify-between px-6 py-3 rounded-2xl backdrop-blur-xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                        boxShadow: `0 4px 20px ${currentTheme.colors.background}40`,
                    }}
                >
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Logo width={120} height={32} className="object-contain" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link key={item.href} href={item.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative px-4 py-2 rounded-xl flex items-center gap-2"
                                        style={{
                                            color: item.label === 'Goals'
                                                ? (active ? '#16a34a' : '#22c55e') // Green for Goals
                                                : (active ? currentTheme.colors.primary : currentTheme.colors.mutedForeground),
                                        }}
                                    >
                                        {active && (
                                            <motion.div
                                                layoutId="navbar-indicator"
                                                className="absolute inset-0 rounded-xl"
                                                style={{
                                                    backgroundColor: item.label === 'Goals'
                                                        ? '#22c55e15' // Green background tint
                                                        : `${currentTheme.colors.primary}15`
                                                }}
                                                transition={{ type: 'spring', duration: 0.5 }}
                                            />
                                        )}
                                        <Icon className="w-4 h-4 relative z-10" />
                                        <span className="text-sm font-medium relative z-10">
                                            {item.label}
                                        </span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side: Notification, Connection Status, Account Menu */}
                    <div className="flex items-center gap-3">
                        {/* Notification Badge */}
                        <NotificationBadge />

                        {/* Connection Status */}
                        <ConnectionStatusIndicator />

                        {/* Account Menu (includes trial status and logout) */}
                        <AccountMenu
                            userName={userName}
                            themeColors={{
                                card: currentTheme.colors.card,
                                border: currentTheme.colors.border,
                                foreground: currentTheme.colors.foreground,
                                mutedForeground: currentTheme.colors.mutedForeground,
                                muted: currentTheme.colors.muted,
                                primary: currentTheme.colors.primary,
                            }}
                        />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="md:hidden mt-2 p-4 rounded-2xl backdrop-blur-xl border"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                borderColor: currentTheme.colors.border,
                            }}
                        >
                            <div className="space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.href);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                                style={{
                                                    backgroundColor: active
                                                        ? (item.label === 'Goals' ? '#22c55e15' : `${currentTheme.colors.primary}15`)
                                                        : 'transparent',
                                                    color: active
                                                        ? (item.label === 'Goals' ? '#16a34a' : currentTheme.colors.primary)
                                                        : (item.label === 'Goals' ? '#22c55e' : currentTheme.colors.foreground),
                                                }}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
}
