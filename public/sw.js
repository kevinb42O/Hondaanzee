/* HondAanZee Service Worker
 * Strategy:
 *  - Navigations (HTML): network-first with offline fallback to cached app shell.
 *  - Hashed build assets (/assets/*): cache-first (immutable).
 *  - Images (.webp/.avif/.svg/.png/.jpg/.jpeg/.jfif): stale-while-revalidate.
 *  - Google Fonts (fonts.gstatic.com): stale-while-revalidate.
 *  - Everything else (Supabase, /api/, analytics, cross-origin): pass-through (no caching).
 *
 * Bumping CACHE_VERSION invalidates all old caches on activate.
 */

const CACHE_VERSION = 'haz-v2026.05.02-2';
const PRECACHE = `${CACHE_VERSION}-precache`;
const RUNTIME_HTML = `${CACHE_VERSION}-html`;
const RUNTIME_ASSETS = `${CACHE_VERSION}-assets`;
const RUNTIME_IMAGES = `${CACHE_VERSION}-images`;
const RUNTIME_FONTS = `${CACHE_VERSION}-fonts`;

const APP_SHELL = ['/', '/index.html', '/site.webmanifest', '/robots.txt'];

const ALLOWED_CACHES = new Set([
  PRECACHE,
  RUNTIME_HTML,
  RUNTIME_ASSETS,
  RUNTIME_IMAGES,
  RUNTIME_FONTS,
]);

// Hosts we explicitly never cache (always go to network).
const NEVER_CACHE_HOST_PATTERNS = [
  /supabase\.co$/i,
  /supabase\.in$/i,
  /vercel-analytics\.com$/i,
  /vitals\.vercel-insights\.com$/i,
];

// Path prefixes we never cache.
const NEVER_CACHE_PATHS = ['/api/', '/admin', '/_meldpunt-admin'];

const IMAGE_EXT = /\.(webp|avif|svg|png|jpg|jpeg|jfif|gif|ico)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) =>
        // Use individual adds so a single 404 doesn't fail the whole install.
        Promise.all(
          APP_SHELL.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map((name) => (ALLOWED_CACHES.has(name) ? undefined : caches.delete(name))),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Allow page to trigger immediate activation after update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function shouldBypass(url) {
  if (NEVER_CACHE_HOST_PATTERNS.some((re) => re.test(url.hostname))) return true;
  if (NEVER_CACHE_PATHS.some((p) => url.pathname.startsWith(p))) return true;
  return false;
}

async function networkFirstHTML(request) {
  const cache = await caches.open(RUNTIME_HTML);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const shell = await caches.match('/index.html');
    if (shell) return shell;
    const root = await caches.match('/');
    if (root) return root;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.ok && (fresh.type === 'basic' || fresh.type === 'cors')) {
    cache.put(request, fresh.clone());
  }
  return fresh;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (shouldBypass(url)) return;

  // Navigation requests → network-first with offline shell fallback.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstHTML(request));
    return;
  }

  const sameOrigin = url.origin === self.location.origin;

  // Hashed build assets (Vite output) → cache-first (immutable).
  if (sameOrigin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, RUNTIME_ASSETS));
    return;
  }

  // Same-origin images → SWR.
  if (sameOrigin && IMAGE_EXT.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_IMAGES));
    return;
  }

  // Google Fonts files → SWR.
  if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com') {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_FONTS));
    return;
  }

  // Default: pass-through (no caching) — Supabase data, analytics, anything else.
});

// ---- Web Push ----
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'HondAanZee', body: event.data ? event.data.text() : '' };
  }
  const title = payload.title || 'HondAanZee';
  const options = {
    body: payload.body || '',
    icon: '/favicon-192x192.svg',
    badge: '/favicon-192x192.svg',
    data: { url: payload.url || '/' },
    tag: payload.tag || 'haz-notification',
    renotify: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            await client.focus();
            if ('navigate' in client) {
              try { await client.navigate(target); } catch (_) { /* noop */ }
            }
            return;
          }
        } catch (_) { /* noop */ }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
