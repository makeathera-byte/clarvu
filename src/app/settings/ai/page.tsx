'use client';

// Force dynamic rendering since parent layout uses cookies for authentication
export const dynamic = 'force-dynamic';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Sparkles, Check, MessageSquare, FileText, Brain } from 'lucide-react';
import { updateAISettingsAction } from '../actions';

export default function AISettingsPage() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [settings, setSettings] = useState({
        ai_personality: 'friendly' as 'coach' | 'strict' | 'friendly' | 'minimal',
        ai_routine_tone: 'casual' as 'professional' | 'casual' | 'minimal',
        ai_summary_depth: 'medium' as 'short' | 'medium' | 'detailed',
        explain_insights: true,
    });

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateAISettingsAction(settings);
            if (result.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        });
    };

    const Option = ({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="flex-1 py-3 rounded-xl font-medium transition-colors"
            style={{
                backgroundColor: selected ? currentTheme.colors.primary : currentTheme.colors.muted,
                color: selected ? '#fff' : currentTheme.colors.foreground,
            }}
        >
            {label}
        </motion.button>
    );

    return (
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                            <Sparkles className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>AI Preferences</h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>Customize how AI assists you</p>
                </motion.div>

                {/* AI Personality */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center gap-3 mb-4">
                        <MessageSquare className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>AI Personality</h2>
                    </div>
                    <p className="text-sm mb-4" style={{ color: currentTheme.colors.mutedForeground }}>How should the AI communicate with you?</p>
                    <div className="flex gap-2">
                        {(['coach', 'strict', 'friendly', 'minimal'] as const).map((p) => (
                            <Option key={p} selected={settings.ai_personality === p} label={p.charAt(0).toUpperCase() + p.slice(1)} onClick={() => setSettings({ ...settings, ai_personality: p })} />
                        ))}
                    </div>
                </motion.div>

                {/* Routine Tone */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>Routine Generation Tone</h2>
                    </div>
                    <div className="flex gap-2">
                        {(['professional', 'casual', 'minimal'] as const).map((t) => (
                            <Option key={t} selected={settings.ai_routine_tone === t} label={t.charAt(0).toUpperCase() + t.slice(1)} onClick={() => setSettings({ ...settings, ai_routine_tone: t })} />
                        ))}
                    </div>
                </motion.div>

                {/* Summary Depth */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>Summary Depth</h2>
                    </div>
                    <div className="flex gap-2">
                        {(['short', 'medium', 'detailed'] as const).map((d) => (
                            <Option key={d} selected={settings.ai_summary_depth === d} label={d.charAt(0).toUpperCase() + d.slice(1)} onClick={() => setSettings({ ...settings, ai_summary_depth: d })} />
                        ))}
                    </div>
                </motion.div>

                {/* Explain Insights */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium" style={{ color: currentTheme.colors.foreground }}>Explain productivity insights</p>
                            <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>Show detailed explanations for AI-generated insights</p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSettings({ ...settings, explain_insights: !settings.explain_insights })}
                            className="w-12 h-6 rounded-full p-1 transition-colors"
                            style={{ backgroundColor: settings.explain_insights ? currentTheme.colors.primary : currentTheme.colors.muted }}
                        >
                            <motion.div animate={{ x: settings.explain_insights ? 24 : 0 }} className="w-4 h-4 rounded-full bg-white" />
                        </motion.button>
                    </div>
                </motion.div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={isPending} className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2" style={{ backgroundColor: saveSuccess ? '#22c55e' : currentTheme.colors.primary, color: '#fff' }}>
                    {saveSuccess ? <><Check className="w-5 h-5" /> Saved!</> : isPending ? 'Saving...' : 'Save Preferences'}
                </motion.button>
            </div>
        </main>
    );
}
