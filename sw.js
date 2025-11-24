const CACHE_NAME = 'wildlife-survey-cache-v1';
const OFFLINE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // HTML navigation: network first, fall back to cache when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return resp;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static assets: cache first, then network fallback
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
