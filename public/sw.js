// Clarvu Service Worker for Push Notifications

self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(self.clients.claim());
});

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
