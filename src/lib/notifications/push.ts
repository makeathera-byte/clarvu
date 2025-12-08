// Push notification utilities
// Uses Web Push API for browser notifications

export async function askNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

export function isNotificationSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
}

export async function showBrowserNotification(
    title: string,
    options?: NotificationOptions
): Promise<void> {
    const hasPermission = await askNotificationPermission();

    if (!hasPermission) {
        console.log('Notification permission denied');
        return;
    }

    // Use service worker if available
    const registration = await navigator.serviceWorker.ready;

    if (registration) {
        registration.showNotification(title, {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            ...options,
        });
    } else {
        // Fallback to regular notification
        new Notification(title, options);
    }
}

// Initialize push notifications
export async function initPushNotifications(): Promise<void> {
    const supported = isNotificationSupported();

    if (!supported) {
        return;
    }

    await registerServiceWorker();
}
