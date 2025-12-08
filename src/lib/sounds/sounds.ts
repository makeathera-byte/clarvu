// Sound library for focus mode
// Audio files should be placed in /public/sounds/

export interface SoundConfig {
    key: string;
    name: string;
    url: string;
    icon: string; // lucide icon name
}

export const SOUND_LIBRARY: SoundConfig[] = [
    { key: 'rain', name: 'Rain', url: '/sounds/rain.mp3', icon: 'CloudRain' },
    { key: 'bonfire', name: 'Bonfire', url: '/sounds/bonfire.mp3', icon: 'Flame' },
    { key: 'birds', name: 'Birds', url: '/sounds/birds.mp3', icon: 'Bird' },
    { key: 'forest', name: 'Forest', url: '/sounds/forest.mp3', icon: 'TreePine' },
    { key: 'cafe', name: 'Cafe', url: '/sounds/cafe.mp3', icon: 'Coffee' },
    { key: 'wind', name: 'Wind', url: '/sounds/wind.mp3', icon: 'Wind' },
    { key: 'stream', name: 'Stream', url: '/sounds/stream.mp3', icon: 'Waves' },
];

export const getSoundByKey = (key: string): SoundConfig | undefined => {
    return SOUND_LIBRARY.find(s => s.key === key);
};
