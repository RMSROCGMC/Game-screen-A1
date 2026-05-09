const CACHE_NAME = 'tkms-escape-v7.6';
const ASSETS = ['./', './index.html', './game.js', './manifest.json', './logo.jpeg']; // 修正檔案名

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
