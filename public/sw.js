// HondAanZee Service Worker — Network-First strategy
// Ensures users ALWAYS get the latest version of the site
const CACHE_VERSION = 'v1';
const CACHE_NAME = `hondaanzee-${CACHE_VERSION}`;

// Install: activate immediately, don't wait
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: claim all clients immediately + clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML, cache-first for hashed assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);

  // Hashed assets in /assets/ are safe to cache-first (filename changes on rebuild)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Everything else: NETWORK-FIRST (always try to get fresh content)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache a copy for offline fallback
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        // Network failed — try cache as fallback
        caches.match(request).then((cached) => cached || caches.match('/'))
      )
  );
});
