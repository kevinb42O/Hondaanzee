// HondAanZee Service Worker — Network-First with proper navigation handling
// v2: fixes white screen on PWA by properly handling navigate requests + pre-caching shell
const CACHE_VERSION = 'v2';
const CACHE_NAME = `hondaanzee-${CACHE_VERSION}`;

// Install: pre-cache the app shell so offline fallback always works, then activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add('/'))
  );
  self.skipWaiting();
});

// Activate: claim all clients immediately + purge ALL old caches
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

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests from our own origin
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);

  // ── Navigation requests (HTML pages): ALWAYS network-first ──
  // This is the critical fix: navigate requests get special treatment
  // so the SPA shell is always fresh, with a guaranteed cached fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', clone));
          }
          return response;
        })
        .catch(() =>
          // Offline: always return the cached app shell (pre-cached on install)
          caches.match('/')
        )
    );
    return;
  }

  // ── Hashed assets in /assets/: cache-first (filename changes on rebuild) ──
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

  // ── Everything else (images, fonts, etc.): network-first ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
