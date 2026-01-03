// Clarvu Service Worker - PWA + Push Notifications
const CACHE_VERSION = 'clarvu-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/clarvu-icon.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('[SW] Cache failed:', err))
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys
                        .filter(key => key.startsWith('clarvu-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                        .map(key => {
                            console.log('[SW] Deleting old cache:', key);
                            return caches.delete(key);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network-first for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }

    // Network-first for API calls (don't cache API responses aggressively)
    if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
        event.respondWith(
            fetch(request)
                .catch(() => new Response(JSON.stringify({ error: 'Offline' }), {
                    headers: { 'Content-Type': 'application/json' }
                }))
        );
        return;
    }

    // Cache-first for static assets
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) {
                    // Return cached version and update cache in background
                    fetch(request)
                        .then(response => {
                            if (response.ok) {
                                caches.open(DYNAMIC_CACHE)
                                    .then(cache => cache.put(request, response));
                            }
                        })
                        .catch(() => { /* Offline, use cache */ });
                    return cached;
                }

                // Not in cache - fetch from network
                return fetch(request)
                    .then(response => {
                        // Cache successful responses for static assets
                        if (response.ok && (
                            request.method === 'GET' &&
                            (url.pathname.endsWith('.js') ||
                                url.pathname.endsWith('.css') ||
                                url.pathname.endsWith('.png') ||
                                url.pathname.endsWith('.jpg') ||
                                url.pathname.endsWith('.svg') ||
                                url.pathname.endsWith('.woff2'))
                        )) {
                            const responseClone = response.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => cache.put(request, responseClone));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Offline fallback for pages
                        if (request.destination === 'document') {
                            return caches.match('/dashboard');
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Push notification handler
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/notifications',
        },
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'dismiss', title: 'Dismiss' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Clarvu', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Get notification data
    const notificationData = event.notification.data || {};
    const urlToOpen = notificationData.url || '/dashboard';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it and send message about the task
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    // Send message to client about the clicked task notification
                    if (notificationData.taskId) {
                        client.postMessage({
                            type: 'TASK_NOTIFICATION_CLICKED',
                            taskId: notificationData.taskId,
                            taskTitle: notificationData.taskTitle,
                        });
                    }
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});

