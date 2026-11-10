/* =========================================================
   sw.js — Service worker
   - Precache aset inti (offline penuh untuk panduan)
   - Navigasi: network-first, fallback ke cache offline
   - Aset statis: cache-first
   ========================================================= */

const CACHE_NAME = 'irk-v6';

const APP_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './js/data.js',
  './js/util.js',
  './js/analyzer.js',
  './js/incidents.js',
  './js/emergency.js',
  './js/checker.js',
  './js/quiz.js',
  './js/mascot.js',
  './js/app.js',
  './assets/img/robot-head.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/img/icon-maskable-512.png',
  './assets/vendor/fontawesome/css/all.min.css',
  './assets/vendor/fontawesome/webfonts/fa-solid-900.woff2',
  './assets/vendor/fontawesome/webfonts/fa-regular-400.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .catch(() => {
        /* Bila satu berkas gagal, jangan gagalkan instalasi seluruhnya. */
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function putInCache(request, response) {
  if (!response || !response.ok || response.type === 'opaque') return;
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; /* CDN dibiarkan langsung */

  /* Navigasi halaman: network-first agar pembaruan cepat terasa. */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  /* Aset statis: cache-first. */
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() => cached);
    })
  );
});
