'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    FileText,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Activity,
    ListTodo,
    Settings,
    Globe,
    Smartphone,
    Filter,
    Crown,
    Layers,
    Download,
    Terminal,
} from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'growth', label: 'User Growth', icon: TrendingUp },
    { id: 'active-users', label: 'Active Users', icon: Activity },
    { id: 'tasks', label: 'Tasks Analytics', icon: ListTodo },
    { id: 'geography', label: 'Geography', icon: Globe },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'funnels', label: 'Funnels', icon: Filter },
    { id: 'productivity', label: 'Productivity', icon: TrendingUp },
    { id: 'cohorts', label: 'Cohorts', icon: Layers },
    { id: 'power-users', label: 'Power Users', icon: Crown },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: CalendarCheck },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'tools', label: 'Tools', icon: Settings },
    { id: 'exports', label: 'Exports', icon: Download },
    { id: 'sql', label: 'SQL Runner', icon: Terminal },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
    const { currentTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`hidden lg:flex flex-col fixed left-4 top-24 bottom-4 z-30 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56'
                    }`}
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                {/* Header */}
                <div className="p-4 border-b" style={{ borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm font-semibold"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                Admin Panel
                            </motion.span>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="w-4 h-4" />
                            ) : (
                                <ChevronLeft className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onTabChange(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isCollapsed ? 'justify-center' : ''
                                    }`}
                                style={{
                                    backgroundColor: isActive
                                        ? `${currentTheme.colors.primary}15`
                                        : 'transparent',
                                    color: isActive
                                        ? currentTheme.colors.primary
                                        : currentTheme.colors.mutedForeground,
                                }}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Footer */}
                {!isCollapsed && (
                    <div
                        className="p-4 border-t text-xs"
                        style={{
                            borderColor: currentTheme.colors.border,
                            color: currentTheme.colors.mutedForeground,
                        }}
                    >
                        Clarvu Admin v1.0
                    </div>
                )}
            </motion.aside>

            {/* Mobile Navigation */}
            <div
                className="lg:hidden fixed top-20 left-4 right-4 z-30 rounded-2xl border backdrop-blur-xl overflow-hidden"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <div className="flex overflow-x-auto p-2 gap-1 scrollbar-hide">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all flex-shrink-0"
                                style={{
                                    backgroundColor: isActive
                                        ? `${currentTheme.colors.primary}15`
                                        : 'transparent',
                                    color: isActive
                                        ? currentTheme.colors.primary
                                        : currentTheme.colors.mutedForeground,
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
