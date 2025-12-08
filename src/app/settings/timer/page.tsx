'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Timer, Check } from 'lucide-react';
import { updateTimerSettingsAction } from '../actions';

export default function TimerSettingsPage() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [settings, setSettings] = useState({
        default_timer_minutes: 25,
        default_break_minutes: 5,
        auto_start_next: false,
        auto_complete_tasks: true,
        enable_immersive_focus: true,
    });

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateTimerSettingsAction(settings);
            if (result.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        });
    };

    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
        <motion.button whileTap={{ scale: 0.9 }} onClick={onChange} className="w-12 h-6 rounded-full p-1 transition-colors" style={{ backgroundColor: enabled ? currentTheme.colors.primary : currentTheme.colors.muted }}>
            <motion.div animate={{ x: enabled ? 24 : 0 }} className="w-4 h-4 rounded-full bg-white" />
        </motion.button>
    );

    return (
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                            <Timer className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>Timer Settings</h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>Configure your timer preferences</p>
                </motion.div>

                {/* Default Timer */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>Default Timer Duration</h2>
                    <div className="flex gap-3">
                        {[25, 30, 45, 60].map((mins) => (
                            <motion.button
                                key={mins}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSettings({ ...settings, default_timer_minutes: mins })}
                                className="flex-1 py-3 rounded-xl font-medium"
                                style={{
                                    backgroundColor: settings.default_timer_minutes === mins ? currentTheme.colors.primary : currentTheme.colors.muted,
                                    color: settings.default_timer_minutes === mins ? '#fff' : currentTheme.colors.foreground,
                                }}
                            >
                                {mins}m
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Break Duration */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>Default Break Duration</h2>
                    <div className="flex gap-3">
                        {[5, 10, 15, 20].map((mins) => (
                            <motion.button
                                key={mins}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSettings({ ...settings, default_break_minutes: mins })}
                                className="flex-1 py-3 rounded-xl font-medium"
                                style={{
                                    backgroundColor: settings.default_break_minutes === mins ? currentTheme.colors.primary : currentTheme.colors.muted,
                                    color: settings.default_break_minutes === mins ? '#fff' : currentTheme.colors.foreground,
                                }}
                            >
                                {mins}m
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Toggles */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>Behavior</h2>
                    <div className="space-y-4">
                        {[
                            { key: 'auto_start_next', label: 'Auto-start next session', desc: 'Automatically start the next timer after a break' },
                            { key: 'auto_complete_tasks', label: 'Auto-complete tasks', desc: 'Mark tasks as complete when timer ends' },
                            { key: 'enable_immersive_focus', label: 'Immersive focus by default', desc: 'Start timers in immersive mode' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium" style={{ color: currentTheme.colors.foreground }}>{item.label}</p>
                                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>{item.desc}</p>
                                </div>
                                <Toggle enabled={settings[item.key as keyof typeof settings] as boolean} onChange={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })} />
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={isPending} className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2" style={{ backgroundColor: saveSuccess ? '#22c55e' : currentTheme.colors.primary, color: '#fff' }}>
                    {saveSuccess ? <><Check className="w-5 h-5" /> Saved!</> : isPending ? 'Saving...' : 'Save Settings'}
                </motion.button>
            </div>
        </main>
    );
}
