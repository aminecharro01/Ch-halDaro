self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body || 'New update from Ch\'hal Daro!',
    icon: '/logo.webp',
    badge: '/logo.webp',
    data: { url: data.url ?? '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: data.tag || 'soccer-update',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Live Score Update', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
