'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Megaphone, Send, Check, AlertCircle } from 'lucide-react';
import { sendBroadcastNotification } from '@/app/notifications/actions';

export function AdminBroadcast() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);

    const [form, setForm] = useState({
        title: '',
        body: '',
    });

    const handleSend = () => {
        if (!form.title.trim()) return;

        startTransition(async () => {
            const res = await sendBroadcastNotification({
                title: form.title,
                body: form.body,
                category: 'admin',
            });

            if (res.success) {
                setResult({ success: true, count: res.count });
                setForm({ title: '', body: '' });
                setTimeout(() => setResult(null), 3000);
            } else {
                setResult({ error: res.error });
            }
        });
    };

    return (
        <div
            className="p-6 rounded-2xl border"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#ef444420' }}
                >
                    <Megaphone className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Broadcast Notification
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Send to all users
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Title
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Notification title"
                        className="w-full px-4 py-3 rounded-xl outline-none"
                        style={{
                            backgroundColor: currentTheme.colors.muted,
                            color: currentTheme.colors.foreground,
                            border: `1px solid ${currentTheme.colors.border}`,
                        }}
                    />
                </div>

                <div>
                    <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Message (optional)
                    </label>
                    <textarea
                        value={form.body}
                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                        placeholder="Notification body text..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                        style={{
                            backgroundColor: currentTheme.colors.muted,
                            color: currentTheme.colors.foreground,
                            border: `1px solid ${currentTheme.colors.border}`,
                        }}
                    />
                </div>

                {/* Result Message */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl"
                        style={{
                            backgroundColor: result.success ? '#22c55e20' : '#ef444420',
                            color: result.success ? '#22c55e' : '#ef4444',
                        }}
                    >
                        {result.success ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span className="text-sm">Sent to {result.count} users</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{result.error}</span>
                            </>
                        )}
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSend}
                    disabled={isPending || !form.title.trim()}
                    className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-white"
                    style={{
                        backgroundColor: '#ef4444',
                        opacity: isPending || !form.title.trim() ? 0.6 : 1,
                    }}
                >
                    {isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Send Broadcast
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
