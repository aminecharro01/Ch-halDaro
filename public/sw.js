self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body || 'New update from Ch\'hal Daro!',
    icon: '/logo.webp',
    badge: '/logo.webp',
    data: { url: '/' },
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
  const homeUrl = new URL('/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then((focused) => {
            if ('navigate' in focused) {
              return focused.navigate(homeUrl);
            }
            return focused;
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(homeUrl);
      }
    })
  );
});
