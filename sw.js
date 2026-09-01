/* 小说创作工作台 Service Worker：网络优先（在线自动更新）+ 离线兜底缓存 */
const CACHE = 'novel-workbench-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // AI 请求不缓存
  e.respondWith(
    // 网络优先：在线时永远拿最新版；断网/失败时回退缓存
    fetch(e.request)
      .then((res) => {
        const cp = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, cp)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./手机版.html')))
  );
});

