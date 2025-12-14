'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useSoundEngine, SOUND_LIBRARY, MIX_PRESETS, type MixPreset } from '@/lib/sounds';
import {
    CloudRain,
    Flame,
    Bird,
    TreePine,
    Coffee,
    Wind,
    Waves,
    Volume2,
    VolumeX,
    Music,
    X,
    Save,
    Play,
    LucideIcon,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
    CloudRain,
    Flame,
    Bird,
    TreePine,
    Coffee,
    Wind,
    Waves,
};

export function FocusSoundPanel() {
    const { currentTheme } = useTheme();
    const { volumes, playing, toggleSound, setVolume } = useSoundEngine();
    const [isExpanded, setIsExpanded] = useState(false);
    const [masterVolume, setMasterVolume] = useState(1);
    const [showMixes, setShowMixes] = useState(false);
    const [customMixes, setCustomMixes] = useState<MixPreset[]>([]);

    const activeSoundsCount = Object.values(playing).filter(Boolean).length;
    const anyPlaying = activeSoundsCount > 0;

    // Load custom mixes from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('clarvu-custom-mixes');
        if (saved) {
            try {
                setCustomMixes(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load custom mixes');
            }
        }
    }, []);

    const toggleAllSounds = () => {
        if (anyPlaying) {
            SOUND_LIBRARY.forEach(sound => {
                if (playing[sound.key]) toggleSound(sound.key);
            });
        }
    };

    const handleMasterVolumeChange = (newVolume: number) => {
        setMasterVolume(newVolume);
        // Apply to all active sounds
        SOUND_LIBRARY.forEach(sound => {
            if (playing[sound.key]) {
                const currentRelativeVolume = volumes[sound.key] ?? 0.5;
                setVolume(sound.key, currentRelativeVolume * newVolume);
            }
        });
    };

    const loadMix = (mix: MixPreset) => {
        // Stop all current sounds
        SOUND_LIBRARY.forEach(sound => {
            if (playing[sound.key]) toggleSound(sound.key);
        });

        // Start sounds from mix
        setTimeout(() => {
            mix.sounds.forEach(({ key, volume }) => {
                if (!playing[key]) toggleSound(key);
                setVolume(key, volume);
            });
        }, 100);
    };

    const saveCurrentMix = () => {
        const activeSounds = SOUND_LIBRARY.filter(s => playing[s.key]).map(s => ({
            key: s.key,
            volume: volumes[s.key] ?? 0.5,
        }));

        if (activeSounds.length === 0) {
            alert('No sounds playing to save');
            return;
        }

        const name = prompt('Name your mix:');
        if (!name) return;

        const newMix: MixPreset = {
            name,
            description: 'Custom mix',
            sounds: activeSounds,
        };

        const updated = [...customMixes, newMix];
        setCustomMixes(updated);
        localStorage.setItem('clarvu-custom-mixes', JSON.stringify(updated));
    };

    const deleteCustomMix = (index: number) => {
        const updated = customMixes.filter((_, i) => i !== index);
        setCustomMixes(updated);
        localStorage.setItem('clarvu-custom-mixes', JSON.stringify(updated));
    };

    const allMixes = [...MIX_PRESETS, ...customMixes];

    return (
        <>
            {/* Compact toggle button (top-right corner) */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed top-6 right-6 z-50 p-3 rounded-xl backdrop-blur-md flex items-center gap-2 shadow-lg"
                style={{
                    backgroundColor: anyPlaying ? currentTheme.colors.primary + '20' : 'rgba(0, 0, 0, 0.4)',
                    border: `1px solid ${anyPlaying ? currentTheme.colors.primary + '40' : 'rgba(255, 255, 255, 0.1)'}`,
                }}
            >
                <Music className="w-5 h-5" style={{ color: anyPlaying ? currentTheme.colors.primary : '#fff' }} />
                {activeSoundsCount > 0 && (
                    <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                            backgroundColor: currentTheme.colors.primary,
                            color: '#fff',
                        }}
                    >
                        {activeSoundsCount}
                    </span>
                )}
            </motion.button>

            {/* Enhanced sound control panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-20 right-6 z-40 p-5 rounded-2xl backdrop-blur-xl shadow-2xl"
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            maxWidth: '580px',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Volume2 className="w-4 h-4 text-white/80" />
                                <span className="text-sm font-medium text-white">Focus Sounds</span>
                                <button
                                    onClick={() => setShowMixes(!showMixes)}
                                    className={`text-xs px-2 py-1 rounded transition-colors ${showMixes ? 'bg-white/20' : 'bg-white/10'}`}
                                    style={{ color: '#fff' }}
                                >
                                    {showMixes ? 'Sounds' : 'Mixes'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {anyPlaying && (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={saveCurrentMix}
                                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                            title="Save mix"
                                        >
                                            <Save className="w-4 h-4 text-white/60" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={toggleAllSounds}
                                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                            title="Mute all"
                                        >
                                            <VolumeX className="w-4 h-4 text-white/60" />
                                        </motion.button>
                                    </>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsExpanded(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/60" />
                                </motion.button>
                            </div>
                        </div>

                        {showMixes ? (
                            /* Mix Presets */
                            <div className="space-y-2">
                                <p className="text-xs text-white/40 mb-3">Quick mixes for different moods</p>
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                    {allMixes.map((mix, index) => (
                                        <motion.button
                                            key={mix.name}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => loadMix(mix)}
                                            className="p-3 rounded-xl text-left transition-all relative group"
                                            style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Play className="w-3 h-3 text-white/60" />
                                                        <span className="text-sm font-medium text-white">{mix.name}</span>
                                                    </div>
                                                    <p className="text-xs text-white/40">{mix.description}</p>
                                                    <p className="text-xs text-white/30 mt-1">{mix.sounds.length} sounds</p>
                                                </div>
                                                {index >= MIX_PRESETS.length && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteCustomMix(index - MIX_PRESETS.length);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Sound icons grid */}
                                <div className="grid grid-cols-8 gap-2 mb-4">
                                    {SOUND_LIBRARY.map((sound) => {
                                        const Icon = iconMap[sound.icon] || Music;
                                        const isPlaying = playing[sound.key] || false;
                                        const volume = volumes[sound.key] ?? 0.5;

                                        return (
                                            <div key={sound.key} className="relative group">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => toggleSound(sound.key)}
                                                    className="w-full aspect-square rounded-xl flex items-center justify-center transition-all relative"
                                                    style={{
                                                        backgroundColor: isPlaying
                                                            ? currentTheme.colors.primary
                                                            : 'rgba(255, 255, 255, 0.08)',
                                                        border: isPlaying
                                                            ? 'none'
                                                            : '1px solid rgba(255, 255, 255, 0.1)',
                                                    }}
                                                >
                                                    <Icon
                                                        className="w-4 h-4"
                                                        style={{ color: isPlaying ? '#fff' : 'rgba(255, 255, 255, 0.5)' }}
                                                    />
                                                </motion.button>

                                                {/* Tooltip */}
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    <span className="text-xs text-white/80 whitespace-nowrap bg-black/80 px-2 py-1 rounded">
                                                        {sound.name}
                                                    </span>
                                                </div>

                                                {/* Volume indicator */}
                                                {isPlaying && (
                                                    <motion.div
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: volume }}
                                                        className="absolute bottom-1 left-1 right-1 h-0.5 rounded-full origin-left"
                                                        style={{ backgroundColor: '#fff' }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Master volume control */}
                                {anyPlaying && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pb-3 mb-3 border-b border-white/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Volume2 className="w-4 h-4 text-white/40" />
                                            <span className="text-xs text-white/60 w-16">Master</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={masterVolume}
                                                onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                                                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                                                style={{
                                                    background: `linear-gradient(to right, ${currentTheme.colors.primary} ${masterVolume * 100}%, rgba(255,255,255,0.15) ${masterVolume * 100}%)`,
                                                }}
                                            />
                                            <span className="text-xs text-white/40 w-10 text-right tabular-nums">
                                                {Math.round(masterVolume * 100)}%
                                            </span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Individual sound volumes */}
                                <AnimatePresence>
                                    {activeSoundsCount > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2"
                                        >
                                            {SOUND_LIBRARY.filter(sound => playing[sound.key]).map((sound) => {
                                                const volume = volumes[sound.key] ?? 0.5;
                                                return (
                                                    <div key={sound.key} className="flex items-center gap-2">
                                                        <span className="text-xs text-white/60 w-20 truncate">{sound.name}</span>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.05"
                                                            value={volume}
                                                            onChange={(e) => setVolume(sound.key, parseFloat(e.target.value))}
                                                            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                                                            style={{
                                                                background: `linear-gradient(to right, ${currentTheme.colors.primary} ${volume * 100}%, rgba(255,255,255,0.15) ${volume * 100}%)`,
                                                            }}
                                                        />
                                                        <span className="text-xs text-white/40 w-10 text-right tabular-nums">
                                                            {Math.round(volume * 100)}%
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}

                        {/* Tip */}
                        <p className="text-xs text-white/30 mt-3 text-center">
                            {showMixes ? 'Load presets or create your own' : 'Mix sounds & save your favorites'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
