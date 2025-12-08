'use client';

// Force dynamic rendering since parent layout uses cookies for authentication
export const dynamic = 'force-dynamic';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Bell, Check, Mail, Clock } from 'lucide-react';
import { updateNotificationSettingsAction } from '../actions';

export default function NotificationsSettingsPage() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [settings, setSettings] = useState({
        notify_timer_end: true,
        notify_scheduled_tasks: true,
        notify_daily_summary: false,
        email_weekly_summary: true,
        email_monthly_report: false,
        activity_reminder_minutes: 30,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateNotificationSettingsAction(settings);
            if (result.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        });
    };

    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
        <motion.button whileTap={{ scale: 0.9 }} onClick={onChange} className={`w-12 h-6 rounded-full p-1 transition-colors ${enabled ? '' : 'opacity-50'}`} style={{ backgroundColor: enabled ? currentTheme.colors.primary : currentTheme.colors.muted }}>
            <motion.div animate={{ x: enabled ? 24 : 0 }} className="w-4 h-4 rounded-full bg-white" />
        </motion.button>
    );

    return (
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                            <Bell className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>Notifications</h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>Manage how you receive notifications</p>
                </motion.div>

                {/* Push Notifications */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>Push Notifications</h2>
                    <div className="space-y-4">
                        {[
                            { key: 'notify_timer_end', label: 'Timer end notifications', desc: 'Get notified when a timer completes' },
                            { key: 'notify_scheduled_tasks', label: 'Scheduled task reminders', desc: 'Remind me about upcoming tasks' },
                            { key: 'notify_daily_summary', label: 'Daily AI overview', desc: 'Receive a daily productivity summary' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium" style={{ color: currentTheme.colors.foreground }}>{item.label}</p>
                                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>{item.desc}</p>
                                </div>
                                <Toggle enabled={settings[item.key as keyof typeof settings] as boolean} onChange={() => handleToggle(item.key as keyof typeof settings)} />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Activity Reminder */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>Activity Reminder</h2>
                    </div>
                    <p className="text-sm mb-4" style={{ color: currentTheme.colors.mutedForeground }}>Remind me to take a break after:</p>
                    <div className="flex gap-2">
                        {[15, 30, 45, 60].map((mins) => (
                            <motion.button
                                key={mins}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSettings({ ...settings, activity_reminder_minutes: mins })}
                                className="px-4 py-2 rounded-xl font-medium"
                                style={{
                                    backgroundColor: settings.activity_reminder_minutes === mins ? currentTheme.colors.primary : currentTheme.colors.muted,
                                    color: settings.activity_reminder_minutes === mins ? '#fff' : currentTheme.colors.foreground,
                                }}
                            >
                                {mins}m
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Email Notifications */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Mail className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>Email Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { key: 'email_weekly_summary', label: 'Weekly summary', desc: 'Get a weekly productivity report' },
                            { key: 'email_monthly_report', label: 'Monthly report', desc: 'Receive detailed monthly analytics' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium" style={{ color: currentTheme.colors.foreground }}>{item.label}</p>
                                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>{item.desc}</p>
                                </div>
                                <Toggle enabled={settings[item.key as keyof typeof settings] as boolean} onChange={() => handleToggle(item.key as keyof typeof settings)} />
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={isPending} className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2" style={{ backgroundColor: saveSuccess ? '#22c55e' : currentTheme.colors.primary, color: '#fff' }}>
                    {saveSuccess ? <><Check className="w-5 h-5" /> Saved!</> : isPending ? 'Saving...' : 'Save Preferences'}
                </motion.button>
            </div>
        </main>
    );
}
