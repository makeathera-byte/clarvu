'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { usePathname } from 'next/navigation';
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
    FileDown,
    ChevronRight,
} from 'lucide-react';

const navItems = [
    { id: 'profile', label: 'Profile', icon: User, href: '/settings/profile' },
    { id: 'theme', label: 'Theme', icon: Palette, href: '/settings/theme' },
    { id: 'wallpaper', label: 'Wallpaper', icon: Image, href: '/settings/wallpaper' },
    { id: 'categories', label: 'Categories', icon: Layers, href: '/settings/categories' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/settings/notifications' },
    { id: 'timer', label: 'Timer', icon: Timer, href: '/settings/timer' },
    { id: 'sounds', label: 'Focus Sounds', icon: Volume2, href: '/settings/sounds' },
    { id: 'ai', label: 'AI Preferences', icon: Sparkles, href: '/settings/ai' },
    { id: 'integrations', label: 'Integrations', icon: Plug, href: '/settings/integrations' },
    { id: 'export', label: 'Exports', icon: FileDown, href: '/settings/export' },
    { id: 'security', label: 'Security', icon: Shield, href: '/settings/security' },
];

export function SettingsSidebar() {
    const { currentTheme } = useTheme();
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/settings') return pathname === '/settings';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed left-0 top-0 w-64 h-screen pt-20 z-40">
                <div className="h-full p-4 overflow-y-auto">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link key={item.id} href={item.href}>
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${active ? 'shadow-lg' : ''
                                            }`}
                                        style={{
                                            backgroundColor: active
                                                ? `${currentTheme.colors.primary}20`
                                                : 'transparent',
                                            color: active
                                                ? currentTheme.colors.primary
                                                : currentTheme.colors.mutedForeground,
                                        }}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium text-sm">{item.label}</span>
                                        {active && (
                                            <ChevronRight className="w-4 h-4 ml-auto" />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Mobile Navigation */}
            <div className="lg:hidden px-4 pt-20 overflow-x-auto">
                <div className="flex gap-2 min-w-max pb-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link key={item.id} href={item.href}>
                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap"
                                    style={{
                                        backgroundColor: active
                                            ? `${currentTheme.colors.primary}20`
                                            : currentTheme.colors.card,
                                        color: active
                                            ? currentTheme.colors.primary
                                            : currentTheme.colors.mutedForeground,
                                        border: `1px solid ${currentTheme.colors.border}`,
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
