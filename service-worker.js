/* Simple offline-first service worker.
   Bump CACHE_VERSION whenever you add/rename pages or assets. */
const CACHE_VERSION = 'stores-v2';
const ASSETS = [
  'index.html',
  'sales-analyzing.html',
  'your-sales.html',
  'cs2-packs.html',
  'assets/css/style.css',
  'assets/css/packs.css',
  'assets/js/app.js',
  'assets/js/packs.js',
  'assets/icons/icon.svg',
  'manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Network-first for navigations, falling back to cache (keeps pages fresh, works offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('index.html')))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
        return res;
      }).catch(() => cached)
    )
  );
});
