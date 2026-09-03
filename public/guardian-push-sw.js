self.addEventListener('push', event => {
    let data = {};
    try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data?.text() }; }
    event.waitUntil(self.registration.showNotification(data.title || 'School notification', { body: data.body || 'You have a new notification.', icon: data.icon || '/favicon.ico', data: { url: data.url || '/parent-services' } }));
});
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data?.url || '/parent-services'));
});
