'use client';


import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Image, Check, SlidersHorizontal } from 'lucide-react';
import { updateWallpaperAction } from '../actions';

const wallpapers = [
    { id: 'forest', name: 'Forest', preview: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
    { id: 'mountains', name: 'Mountains', preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
    { id: 'minimal', name: 'Minimal Dark', preview: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)' },
    { id: 'gradient', name: 'Gradient', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'city', name: 'City', preview: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
    { id: 'workspace', name: 'Workspace', preview: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)' },
];

export default function WallpaperSettingsPage() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [selected, setSelected] = useState('forest');
    const [blur, setBlur] = useState(10);
    const [brightness, setBrightness] = useState(80);

    const handleSave = () => {
        startTransition(async () => {
            await updateWallpaperAction({
                wallpaper: selected,
                wallpaper_blur: blur,
                wallpaper_brightness: brightness,
            });
        });
    };

    return (
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                            <Image className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>Wallpaper</h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>Choose your background wallpaper</p>
                </motion.div>

                {/* Wallpaper Grid */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>Built-in Wallpapers</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {wallpapers.map((wp) => (
                            <motion.div
                                key={wp.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelected(wp.id)}
                                className={`relative h-24 rounded-xl cursor-pointer overflow-hidden ${selected === wp.id ? 'ring-2 ring-blue-500' : ''}`}
                                style={{ background: wp.preview }}
                            >
                                <div className="absolute inset-0 flex items-end p-2">
                                    <span className="text-xs font-medium text-white drop-shadow">{wp.name}</span>
                                </div>
                                {selected === wp.id && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.primary }}>
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Adjustments */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center gap-3 mb-4">
                        <SlidersHorizontal className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>Adjustments</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm" style={{ color: currentTheme.colors.foreground }}>Blur</label>
                                <span className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>{blur}px</span>
                            </div>
                            <input type="range" min="0" max="30" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full" style={{ accentColor: currentTheme.colors.primary }} />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm" style={{ color: currentTheme.colors.foreground }}>Brightness</label>
                                <span className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>{brightness}%</span>
                            </div>
                            <input type="range" min="20" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" style={{ accentColor: currentTheme.colors.primary }} />
                        </div>
                    </div>
                </motion.div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={isPending} className="w-full py-3 rounded-xl font-medium" style={{ backgroundColor: currentTheme.colors.primary, color: '#fff' }}>
                    {isPending ? 'Saving...' : 'Save Wallpaper'}
                </motion.button>
            </div>
        </main>
    );
}
