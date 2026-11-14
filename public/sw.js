// Offline support.
// Pages: network first (always the newest version when online), cached copy when offline.
// Built assets have content hashes in their names, so they can be served from the cache.
const CACHE = 'workbench-v3';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./']))); });
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  const isPage = req.mode === 'navigate' || req.destination === 'document';
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    if (isPage) {
      try { const res = await fetch(req); if (res.ok) cache.put('./', res.clone()); return res; }
      catch { return (await cache.match('./')) || Response.error(); }
    }
    const hit = await cache.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  }));
});
