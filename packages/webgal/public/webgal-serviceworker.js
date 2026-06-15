const CACHE_PREFIX = 'webgal-';
const CACHE_NAME = 'webgal-build-assets-v1';
const LOG_PREFIX = '[WebGAL]';
const HASHED_BUILD_ASSET_RE = /(^|\/)assets\/[^/?#]+-[A-Za-z0-9_-]{8,}\.(?:js|css|ttf|woff|woff2)$/;

// Title-screen assets to pre-warm into LRU on SW activate
const TITLE_WARM = ['background/WebGalEnter.png', 'config.txt', 'scene/start.txt'];

const loggedKeys = new Set();
function logOnce(key, ...args) {
  if (loggedKeys.has(key)) return;
  loggedKeys.add(key);
  console.log(LOG_PREFIX, ...args);
}

// ── hexz LRU cache (bytes), 32 MB limit ──
const hexzCache = (() => {
  const m = new Map();
  const MAX = 32 * 1024 * 1024;
  let total = 0;
  const sizeOf = (b) => b.byteLength || b.length;
  return {
    get(p) {
      const v = m.get(p);
      if (v) { m.delete(p); m.set(p, v); }
      return v;
    },
    set(p, bytes) {
      const s = sizeOf(bytes);
      if (s > MAX) return;
      m.delete(p);
      m.set(p, bytes);
      total += s;
      while (total > MAX) {
        const it = m.keys().next();
        if (it.done) break;
        total -= sizeOf(m.get(it.value));
        m.delete(it.value);
      }
    },
  };
})();

// ── hexz IPC relay ──
function hexzRead(path) {
  return new Promise((resolve, reject) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = (e) => (e.data.ok ? resolve(e.data.bytes) : reject(new Error(e.data.error)), ch.port1.close());
    self.clients.matchAll({ type: 'window' }).then(([c]) => c
      ? c.postMessage({ type: 'HEXZ_READ_FILE', path }, [ch.port2])
      : reject(new Error('No client')));
  });
}

// ── MIME lookup ──
const MIME = {
  css:'text/css', js:'application/javascript', json:'application/json',
  png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp',
  gif:'image/gif', svg:'image/svg+xml', webm:'audio/webm', mp3:'audio/mpeg',
  ogg:'audio/ogg', wav:'audio/wav', mp4:'video/mp4',
  woff2:'font/woff2', woff:'font/woff', ttf:'font/ttf',
  txt:'text/plain', html:'text/html', scss:'text/css',
};
function mime(p) { return MIME[p.split('.').pop().toLowerCase()] || 'application/octet-stream'; }

function hexzResponse(path, bytes) {
  return new Response(bytes.buffer ? bytes : new Uint8Array(bytes),
    { headers: { 'Content-Type': mime(path) } });
}

// ── Lifecycle ──
self.addEventListener('install', (e) => {
  logOnce('install', CACHE_NAME);
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  logOnce('activate', CACHE_NAME);
  e.waitUntil((async () => {
    // Clean old Cache API caches
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map((k) => caches.delete(k)),
    );
    await self.clients.claim();

    // Pre-warm title assets into LRU
    for (const asset of TITLE_WARM) {
      try { const b = await hexzRead(asset); hexzCache.set(asset, b); } catch (_) {}
    }
  })());
});

function isHashedBuildAsset(r) {
  if (r.method !== 'GET') return false;
  const u = new URL(r.url);
  return u.origin === self.location.origin && HASHED_BUILD_ASSET_RE.test(u.pathname);
}

async function cacheFirst(r) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(r);
  if (hit) { logOnce(`hit:${r.url}`, 'cache hit:', new URL(r.url).pathname); return hit; }
  const resp = await fetch(r);
  if (resp.ok && resp.status === 200) { cache.put(r, resp.clone()).catch(() => {}); }
  return resp;
}

// ── Fetch handler ──
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (isHashedBuildAsset(request)) {
    e.respondWith(cacheFirst(request).catch(() => fetch(request)));
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!/\.(png|jpe?g|webp|gif|svg|webm|mp3|ogg|wav|mp4|woff2?|ttf|json|txt|css|scss)$/i.test(url.pathname)) return;
  if (!url.pathname.includes('game/')) return;

  e.respondWith((async () => {
    try {
      let p = decodeURIComponent(url.pathname.replace(/^\//, ''));
      if (p.startsWith('game/')) p = p.slice(5);
      let bytes = hexzCache.get(p);
      if (!bytes) { bytes = await hexzRead(p); hexzCache.set(p, bytes); }
      return hexzResponse(p, bytes);
    } catch (_) { return fetch(request); }
  })());
});
