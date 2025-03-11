/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules/workbox-precaching

// Precache manifest will be injected by the build process.
self.__WB_MANIFEST = [].concat(self.__WB_MANIFEST || []);

// Skip waiting so that the new service worker activates immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Custom fetch handler for offline support
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
  }
});