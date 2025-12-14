'use client';


import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import Link from 'next/link';
import {
    User,
    Palette,
    Image,
    Layers,
    Bell,
    Timer,
    Volume2,
    Sparkles,
    Plug,
    Shield,
    ChevronRight,
    Award,
} from 'lucide-react';

const quickLinks = [
    { label: 'Profile', icon: User, href: '/settings/profile', color: '#3b82f6' },
    { label: 'Theme', icon: Palette, href: '/settings/theme', color: '#22c55e' },
    { label: 'Categories', icon: Layers, href: '/settings/categories', color: '#f59e0b' },
    { label: 'Timer', icon: Timer, href: '/settings/timer', color: '#ef4444' },
    { label: 'Integrations', icon: Plug, href: '/settings/integrations', color: '#a855f7' },
    { label: 'Security', icon: Shield, href: '/settings/security', color: '#6b7280' },
];

export default function SettingsOverviewPage() {
    const { currentTheme } = useTheme();

    return (
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Settings
                    </h1>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        Manage your account, preferences, and customizations
                    </p>
                </motion.div>

                {/* Account Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl border mb-6"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                            style={{
                                background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.accent} 100%)`,
                                color: '#fff',
                            }}
                        >
                            U
                        </div>
                        <div className="flex-1">
                            <h2
                                className="text-lg font-semibold"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                Clarvu User
                            </h2>
                            <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                                user@example.com
                            </p>
                        </div>
                        <Link href="/settings/profile">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-4 py-2 rounded-xl text-sm font-medium"
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    color: '#fff',
                                }}
                            >
                                Edit Profile
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Current Theme */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-6 rounded-2xl border mb-6"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.accent} 100%)`,
                                }}
                            />
                            <div>
                                <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Current Theme
                                </p>
                                <p className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                                    {currentTheme.name}
                                </p>
                            </div>
                        </div>
                        <Link href="/settings/theme">
                            <ChevronRight className="w-5 h-5" style={{ color: currentTheme.colors.mutedForeground }} />
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                >
                    {[
                        { label: 'Account Age', value: '30 days' },
                        { label: 'Tasks Completed', value: '142' },
                        { label: 'Focus Time', value: '48h' },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="p-4 rounded-xl text-center"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                border: `1px solid ${currentTheme.colors.border}`,
                            }}
                        >
                            <p className="text-lg font-bold" style={{ color: currentTheme.colors.foreground }}>
                                {stat.value}
                            </p>
                            <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* Quick Links Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Quick Access
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {quickLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link key={link.href} href={link.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="p-4 rounded-2xl border flex flex-col items-center gap-3 cursor-pointer transition-all"
                                        style={{
                                            backgroundColor: currentTheme.colors.card,
                                            borderColor: currentTheme.colors.border,
                                        }}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${link.color}20` }}
                                        >
                                            <Icon className="w-6 h-6" style={{ color: link.color }} />
                                        </div>
                                        <span
                                            className="text-sm font-medium"
                                            style={{ color: currentTheme.colors.foreground }}
                                        >
                                            {link.label}
                                        </span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Productivity Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 p-6 rounded-2xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)' }}
                        >
                            <Award className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                                Your Productivity Score
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-amber-500">78</p>
                                <span className="text-xs text-green-500">+5 from last week</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
