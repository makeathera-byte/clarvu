// Focus sound definitions
// Audio files are placeholders - replace with actual audio files in public/audio/

import {
    CloudRain,
    Flame,
    Bird,
    Trees,
    Coffee,
    Wind,
    Waves,
    LucideIcon
} from 'lucide-react';

export interface FocusSound {
    id: string;
    name: string;
    icon: LucideIcon;
    audioSrc: string;
    description: string;
}

export const focusSounds: FocusSound[] = [
    {
        id: 'rain',
        name: 'Rain',
        icon: CloudRain,
        audioSrc: '/audio/rain.mp3',
        description: 'Gentle rain falling',
    },
    {
        id: 'bonfire',
        name: 'Bonfire',
        icon: Flame,
        audioSrc: '/audio/bonfire.mp3',
        description: 'Crackling campfire',
    },
    {
        id: 'birds',
        name: 'Birds',
        icon: Bird,
        audioSrc: '/audio/birds.mp3',
        description: 'Morning bird songs',
    },
    {
        id: 'forest',
        name: 'Forest',
        icon: Trees,
        audioSrc: '/audio/forest.mp3',
        description: 'Forest ambience',
    },
    {
        id: 'cafe',
        name: 'Cafe',
        icon: Coffee,
        audioSrc: '/audio/cafe.mp3',
        description: 'Coffee shop noise',
    },
    {
        id: 'wind',
        name: 'Wind',
        icon: Wind,
        audioSrc: '/audio/wind.mp3',
        description: 'Gentle breeze',
    },
    {
        id: 'stream',
        name: 'Stream',
        icon: Waves,
        audioSrc: '/audio/stream.mp3',
        description: 'Flowing water',
    },
];

// Placeholder for audio management
// Audio playback logic will be implemented later
export const createAudioElement = (sound: FocusSound): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null;

    const audio = new Audio(sound.audioSrc);
    audio.loop = true;
    audio.volume = 0.5;
    return audio;
};
