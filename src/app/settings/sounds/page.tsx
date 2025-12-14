'use client';


import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Volume2, CloudRain, Trees, Coffee, Wind, Music, Save, Plus } from 'lucide-react';

const sounds = [
    { id: 'rain', name: 'Rain', icon: CloudRain, color: '#3b82f6' },
    { id: 'forest', name: 'Forest', icon: Trees, color: '#22c55e' },
    { id: 'cafe', name: 'Cafe', icon: Coffee, color: '#f59e0b' },
    { id: 'wind', name: 'Wind', icon: Wind, color: '#8b5cf6' },
];

const presets = [
    { id: 'night-focus', name: 'Night Focus', sounds: { rain: 70, wind: 30 } },
    { id: 'deep-forest', name: 'Deep Forest', sounds: { forest: 80, rain: 20 } },
    { id: 'coffee-shop', name: 'Coffee Shop', sounds: { cafe: 60, rain: 40 } },
];

export default function SoundsSettingsPage() {
    const { currentTheme } = useTheme();
    const [volumes, setVolumes] = useState<Record<string, number>>({
        rain: 50,
        forest: 30,
        cafe: 0,
        wind: 0,
    });

    const handleVolumeChange = (id: string, value: number) => {
        setVolumes({ ...volumes, [id]: value });
    };

    const applyPreset = (preset: typeof presets[0]) => {
        const newVolumes = { rain: 0, forest: 0, cafe: 0, wind: 0 };
        Object.entries(preset.sounds).forEach(([key, val]) => {
            newVolumes[key as keyof typeof newVolumes] = val;
        });
        setVolumes(newVolumes);
    };

    return (
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                            <Volume2 className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>Focus Sounds</h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>Configure ambient sounds for focus mode</p>
                </motion.div>

                {/* Sound Mixer */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>Sound Mixer</h2>
                    <div className="space-y-4">
                        {sounds.map((sound) => {
                            const Icon = sound.icon;
                            const volume = volumes[sound.id] || 0;
                            return (
                                <div key={sound.id} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${sound.color}20` }}>
                                        <Icon className="w-5 h-5" style={{ color: sound.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium" style={{ color: currentTheme.colors.foreground }}>{sound.name}</span>
                                            <span className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>{volume}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={volume}
                                            onChange={(e) => handleVolumeChange(sound.id, Number(e.target.value))}
                                            className="w-full"
                                            style={{ accentColor: sound.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Presets */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>Sound Presets</h2>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-1 text-sm" style={{ color: currentTheme.colors.primary }}>
                            <Plus className="w-4 h-4" /> Save Current
                        </motion.button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {presets.map((preset) => (
                            <motion.button
                                key={preset.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => applyPreset(preset)}
                                className="p-4 rounded-xl text-center transition-colors"
                                style={{ backgroundColor: currentTheme.colors.muted, color: currentTheme.colors.foreground }}
                            >
                                <Music className="w-6 h-6 mx-auto mb-2" style={{ color: currentTheme.colors.primary }} />
                                <p className="text-sm font-medium">{preset.name}</p>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2" style={{ backgroundColor: currentTheme.colors.primary, color: '#fff' }}>
                    <Save className="w-5 h-5" /> Save as Default
                </motion.button>
            </div>
        </main>
    );
}
