// Mi Home Gym: guarda la app en el teléfono para que abra sin internet.
// Al publicar cambios, sube el número de CACHE (v2, v3...) para que el iPhone los reciba.
const CACHE = 'home-gym-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const network = caches.open(CACHE).then(c =>
    fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; })
  );
  e.waitUntil(network.catch(() => {}));
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit =>
      hit || network.catch(() => caches.match('./index.html'))
    )
  );
});
