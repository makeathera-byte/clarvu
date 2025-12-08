import { create } from 'zustand';
import { SOUND_LIBRARY } from './sounds';

interface SoundState {
    sounds: Record<string, HTMLAudioElement | null>;
    volumes: Record<string, number>;
    playing: Record<string, boolean>;
    loaded: boolean;
}

interface SoundActions {
    loadSounds: () => void;
    loadSound: (key: string, url: string) => void;
    playSound: (key: string) => void;
    stopSound: (key: string) => void;
    toggleSound: (key: string) => void;
    setVolume: (key: string, volume: number) => void;
    stopAllSounds: () => void;
    isPlaying: (key: string) => boolean;
}

type SoundStore = SoundState & SoundActions;

export const useSoundEngine = create<SoundStore>((set, get) => ({
    sounds: {},
    volumes: {},
    playing: {},
    loaded: false,

    loadSounds: () => {
        if (get().loaded) return;

        SOUND_LIBRARY.forEach(({ key, url }) => {
            get().loadSound(key, url);
        });

        set({ loaded: true });
    },

    loadSound: (key: string, url: string) => {
        // Only load in browser
        if (typeof window === 'undefined') return;

        const audio = new Audio(url);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0.5;

        set(state => ({
            sounds: { ...state.sounds, [key]: audio },
            volumes: { ...state.volumes, [key]: 0.5 },
            playing: { ...state.playing, [key]: false },
        }));
    },

    playSound: (key: string) => {
        const audio = get().sounds[key];
        if (audio) {
            audio.play().catch(console.error);
            set(state => ({
                playing: { ...state.playing, [key]: true },
            }));
        }
    },

    stopSound: (key: string) => {
        const audio = get().sounds[key];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            set(state => ({
                playing: { ...state.playing, [key]: false },
            }));
        }
    },

    toggleSound: (key: string) => {
        const isPlaying = get().playing[key];
        if (isPlaying) {
            get().stopSound(key);
        } else {
            get().playSound(key);
        }
    },

    setVolume: (key: string, volume: number) => {
        const audio = get().sounds[key];
        if (audio) {
            audio.volume = Math.max(0, Math.min(1, volume));
        }
        set(state => ({
            volumes: { ...state.volumes, [key]: volume },
        }));
    },

    stopAllSounds: () => {
        const sounds = get().sounds;
        Object.keys(sounds).forEach(key => {
            const audio = sounds[key];
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        set(state => ({
            playing: Object.keys(state.playing).reduce((acc, key) => {
                acc[key] = false;
                return acc;
            }, {} as Record<string, boolean>),
        }));
    },

    isPlaying: (key: string) => {
        return get().playing[key] || false;
    },
}));
