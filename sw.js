const CACHE_NAME = 'warrior-history-v2'; // 每次更新檔案建議改一下版本號(v1變v2)
const ASSETS_TO_CACHE = [
  'index.html',
  'game.js',
  '1778345687994.png', // 確保這裡改成了你的實際圖檔名稱
  'manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 其餘邏輯保持不變...
