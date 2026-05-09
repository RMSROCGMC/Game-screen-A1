const CACHE_NAME = 'tkms-v5';
const ASSETS = ['./', './index.html', './game.js', './questions.js', './manifest.json', './logo.jpeg'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
