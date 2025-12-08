'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Shield, Key, Smartphone, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { requestPasswordResetAction, deleteAccountAction } from '../actions';

const sessions = [
    { id: '1', device: 'Chrome on Windows', location: 'New York, US', current: true, lastActive: 'Now' },
    { id: '2', device: 'Safari on macOS', location: 'London, UK', current: false, lastActive: '2 hours ago' },
    { id: '3', device: 'Mobile App on iOS', location: 'Tokyo, JP', current: false, lastActive: '1 day ago' },
];

export default function SecuritySettingsPage() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handlePasswordReset = () => {
        startTransition(async () => {
            const result = await requestPasswordResetAction();
            if (result.success) {
                alert('Password reset email sent!');
            }
        });
    };

    const handleDeleteAccount = () => {
        startTransition(async () => {
            await deleteAccountAction();
            window.location.href = '/';
        });
    };

    return (
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                            <Shield className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>Security</h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>Manage your account security</p>
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Key className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>Password</h2>
                    </div>
                    <p className="text-sm mb-4" style={{ color: currentTheme.colors.mutedForeground }}>Last updated: 30 days ago</p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePasswordReset} disabled={isPending} className="px-6 py-2 rounded-xl font-medium" style={{ backgroundColor: currentTheme.colors.muted, color: currentTheme.colors.foreground }}>
                        Reset Password
                    </motion.button>
                </motion.div>

                {/* Two-Factor */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                            <div>
                                <h2 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>Two-Factor Authentication</h2>
                                <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>Add an extra layer of security</p>
                            </div>
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: currentTheme.colors.muted, color: currentTheme.colors.mutedForeground }}>Coming Soon</span>
                    </div>
                </motion.div>

                {/* Active Sessions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                            <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>Active Sessions</h2>
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} className="text-sm text-red-500 flex items-center gap-1">
                            <LogOut className="w-4 h-4" /> End All
                        </motion.button>
                    </div>
                    <div className="space-y-3">
                        {sessions.map((s) => (
                            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: s.current ? `${currentTheme.colors.primary}10` : currentTheme.colors.muted }}>
                                <div>
                                    <p className="font-medium flex items-center gap-2" style={{ color: currentTheme.colors.foreground }}>
                                        {s.device}
                                        {s.current && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">Current</span>}
                                    </p>
                                    <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>{s.location} · {s.lastActive}</p>
                                </div>
                                {!s.current && (
                                    <motion.button whileHover={{ scale: 1.1 }} className="p-2 rounded-lg hover:bg-red-500/20">
                                        <LogOut className="w-4 h-4 text-red-500" />
                                    </motion.button>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-6 rounded-2xl border" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
                    </div>
                    <p className="text-sm mb-4" style={{ color: currentTheme.colors.mutedForeground }}>
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-6 py-2 rounded-xl font-medium bg-red-500 text-white">
                        <Trash2 className="w-4 h-4" /> Delete Account
                    </motion.button>
                </motion.div>

                {/* Delete Modal */}
                {showDeleteModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-6 rounded-2xl max-w-md w-full" style={{ backgroundColor: currentTheme.colors.card }}>
                            <h3 className="text-xl font-bold mb-4 text-red-500">Delete Account?</h3>
                            <p className="mb-6" style={{ color: currentTheme.colors.mutedForeground }}>This will permanently delete all your data. Are you absolutely sure?</p>
                            <div className="flex gap-3">
                                <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 rounded-xl" style={{ backgroundColor: currentTheme.colors.muted, color: currentTheme.colors.foreground }}>
                                    Cancel
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} onClick={handleDeleteAccount} disabled={isPending} className="flex-1 py-2 rounded-xl bg-red-500 text-white">
                                    {isPending ? 'Deleting...' : 'Delete'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
