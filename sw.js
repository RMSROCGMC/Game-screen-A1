const CACHE_NAME = 'escape-tkms-v2';

// 需要快取的檔案清單 (確保路徑正確)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './game.js',
  './manifest.json',
  // 如果你有拆分題庫檔案，記得也加進來
  // './questions.js', 
  // 維基百科的圖片因為是外部鏈接，會透過 fetch 攔截來處理
];

// 1. 安裝階段：將所有本地資源存入快取
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 正在預載入資源...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // 強制跳過等待，立即生效
});

// 2. 激活階段：清理舊版本的快取，確保玩家玩到的是最新版
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] 清理舊版快取:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. 攔截請求：這是離線遊玩的關鍵邏輯
self.addEventListener('fetch', (event) => {
  // 對於維基百科的校徽圖片，我們採取「先讀快取，沒有就抓網路」策略
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果快取中有，直接回傳
      if (response) return response;

      // 如果快取沒有，則去網路抓取
      return fetch(event.request).then((networkResponse) => {
        // 如果是有效的圖片請求（如 Wiki 校徽），順便存入快取方便下次離線使用
        if (event.request.url.includes('wikimedia.org')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // 當完全沒網路且快取也沒資料時，可以在這裡回傳一個預設圖或頁面
    })
  );
});
