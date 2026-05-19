// Minimal service worker — enables registration.showNotification()
// which always surfaces in the OS notification bar regardless of tab focus.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
