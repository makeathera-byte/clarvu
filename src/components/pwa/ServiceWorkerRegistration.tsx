'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('[SW] Service Worker registered successfully:', registration.scope);
                })
                .catch((error) => {
                    console.error('[SW] Service Worker registration failed:', error);
                });
        } else {
            console.warn('[SW] Service Workers not supported');
        }
    }, []);

    return null;
}
