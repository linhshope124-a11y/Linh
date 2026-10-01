// ================================================================
// SPX Tracker — Self-destruct SW
// Mục đích: Xóa hết cache cũ + tự unregister
// Sau khi push 1 lần, browser sẽ load bản mới sạch
// ================================================================

const CACHE = 'spx-self-destruct-v40';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => {
        clients.forEach(c => {
          try { c.navigate(c.url); } catch {}
        });
      })
  );
});

self.addEventListener('fetch', e => {
  // Không cache gì cả — luôn fetch từ network
  e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
});