// Sound library for focus mode
// Audio files should be placed in /public/sounds/

export interface SoundConfig {
    key: string;
    name: string;
    url: string;
    icon: string; // lucide icon name
}

export interface MixPreset {
    name: string;
    description: string;
    sounds: { key: string; volume: number }[];
}

export const SOUND_LIBRARY: SoundConfig[] = [
    { key: 'rain', name: 'Rain', url: '/sounds/rain.mp3', icon: 'CloudRain' },
    { key: 'bonfire', name: 'Bonfire', url: '/sounds/bonfire.mp3', icon: 'Flame' },
    { key: 'birds', name: 'Birds', url: '/sounds/birds.mp3', icon: 'Bird' },
    { key: 'forest', name: 'Forest', url: '/sounds/forest.mp3', icon: 'TreePine' },
    { key: 'cafe', name: 'Cafe', url: '/sounds/cafe.mp3', icon: 'Coffee' },
    { key: 'wind', name: 'Wind', url: '/sounds/wind.mp3', icon: 'Wind' },
    { key: 'stream', name: 'Stream', url: '/sounds/stream.mp3', icon: 'Waves' },
    { key: 'thunder', name: 'Thunder', url: '/sounds/thunder.mp3', icon: 'CloudRain' },
    { key: 'ocean', name: 'Ocean', url: '/sounds/ocean.mp3', icon: 'Waves' },
    { key: 'whitenoise', name: 'White Noise', url: '/sounds/whitenoise.mp3', icon: 'Wind' },
    { key: 'night', name: 'Night', url: '/sounds/night.mp3', icon: 'Bird' },
    { key: 'train', name: 'Train', url: '/sounds/train.mp3', icon: 'Wind' },
    { key: 'keyboard', name: 'Keyboard', url: '/sounds/keyboard.mp3', icon: 'Coffee' },
    { key: 'fan', name: 'Fan', url: '/sounds/fan.mp3', icon: 'Wind' },
    { key: 'library', name: 'Library', url: '/sounds/library.mp3', icon: 'Coffee' },
];

export const MIX_PRESETS: MixPreset[] = [
    {
        name: 'Rainy Day',
        description: 'Perfect for deep focus',
        sounds: [
            { key: 'rain', volume: 0.7 },
            { key: 'thunder', volume: 0.3 },
            { key: 'wind', volume: 0.4 },
        ],
    },
    {
        name: 'Forest Retreat',
        description: 'Nature\'s calm',
        sounds: [
            { key: 'forest', volume: 0.6 },
            { key: 'birds', volume: 0.5 },
            { key: 'stream', volume: 0.5 },
        ],
    },
    {
        name: 'Cozy Cafe',
        description: 'Productive ambience',
        sounds: [
            { key: 'cafe', volume: 0.6 },
            { key: 'keyboard', volume: 0.3 },
            { key: 'rain', volume: 0.4 },
        ],
    },
    {
        name: 'Ocean Breeze',
        description: 'Coastal serenity',
        sounds: [
            { key: 'ocean', volume: 0.7 },
            { key: 'wind', volume: 0.4 },
            { key: 'birds', volume: 0.3 },
        ],
    },
    {
        name: 'Night Focus',
        description: 'Late night coding',
        sounds: [
            { key: 'night', volume: 0.6 },
            { key: 'keyboard', volume: 0.4 },
            { key: 'fan', volume: 0.3 },
        ],
    },
    {
        name: 'Pure Focus',
        description: 'Minimal distraction',
        sounds: [
            { key: 'whitenoise', volume: 0.5 },
            { key: 'fan', volume: 0.4 },
        ],
    },
];

export const getSoundByKey = (key: string): SoundConfig | undefined => {
    return SOUND_LIBRARY.find(s => s.key === key);
};
