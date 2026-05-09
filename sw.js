const CACHE_NAME = 'tkms-v13';
const ASSETS = ['./', './index.html', './game.js', './questions.js', './manifest.json', './logo.jpeg'];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keys) => {
        return Promise.all(keys.map((k) => {
            if (k !== CACHE_NAME) return caches.delete(k);
        }));
    }));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
