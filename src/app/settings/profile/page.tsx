'use client';


import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { User, Camera, Check, MapPin, Clock } from 'lucide-react';
import { updateProfileAction } from '../actions';

export default function ProfileSettingsPage() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [form, setForm] = useState({
        full_name: '',
        bio: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        country: '',
    });

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateProfileAction(form);
            if (result.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        });
    };

    return (
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                        >
                            <User className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>
                            Profile Settings
                        </h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        Manage your personal information
                    </p>
                </motion.div>

                {/* Avatar Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl border mb-6"
                    style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
                >
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>
                        Profile Photo
                    </h2>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold relative"
                            style={{
                                background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.accent} 100%)`,
                                color: '#fff',
                            }}
                        >
                            {form.full_name?.[0]?.toUpperCase() || 'U'}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: currentTheme.colors.primary, color: '#fff' }}
                            >
                                <Camera className="w-4 h-4" />
                            </motion.button>
                        </div>
                        <div>
                            <p className="font-medium" style={{ color: currentTheme.colors.foreground }}>
                                Upload new photo
                            </p>
                            <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                                JPG, PNG or GIF. Max 2MB
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl border mb-6"
                    style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
                >
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>
                        Personal Information
                    </h2>

                    <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                    border: `1px solid ${currentTheme.colors.border}`,
                                }}
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Bio
                            </label>
                            <textarea
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                    border: `1px solid ${currentTheme.colors.border}`,
                                }}
                            />
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                    <MapPin className="w-4 h-4" /> Country
                                </label>
                                <input
                                    type="text"
                                    value={form.country}
                                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                                    placeholder="e.g., United States"
                                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                                    style={{
                                        backgroundColor: currentTheme.colors.muted,
                                        color: currentTheme.colors.foreground,
                                        border: `1px solid ${currentTheme.colors.border}`,
                                    }}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                    <Clock className="w-4 h-4" /> Timezone
                                </label>
                                <input
                                    type="text"
                                    value={form.timezone}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl outline-none opacity-70"
                                    style={{
                                        backgroundColor: currentTheme.colors.muted,
                                        color: currentTheme.colors.foreground,
                                        border: `1px solid ${currentTheme.colors.border}`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                    style={{
                        backgroundColor: saveSuccess ? '#22c55e' : currentTheme.colors.primary,
                        color: '#fff',
                        opacity: isPending ? 0.7 : 1,
                    }}
                >
                    {isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saveSuccess ? (
                        <>
                            <Check className="w-5 h-5" /> Saved!
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </motion.button>
            </div>
        </main>
    );
}
