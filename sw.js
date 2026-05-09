// 定義緩存名稱，每次更新遊戲內容時，建議修改後方的 v 數字（例如 v1 -> v2）
const CACHE_NAME = 'warrior-history-v2';

// 需要離線緩存的檔案清單
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './game.js',
    './1778345687994.png',
    './manifest.json'
];

// 1. 安裝階段：將資源寫入緩存
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('正在緩存遊戲資源...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // 強制跳過等待，立即啟用新版本
    );
});

// 2. 激活階段：清理舊版本的緩存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('清理舊緩存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 立即取得頁面控制權
    );
});

// 3. 攔截請求：優先從緩存讀取，若無則從網路下載
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果緩存中有，直接回傳；否則發起網絡請求
                return response || fetch(event.request);
            })
    );
});
