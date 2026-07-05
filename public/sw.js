const CACHE_NAME = "offbeat-cache-v2";
const urlsToCache = ["/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];
 
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});
 
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
self.addEventListener("fetch", (event) => {
  // Never cache API calls
  if (event.request.url.includes("/api/")) {
    return;
  }
 
  // Network-first for page navigations, so users always get the latest build
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
 
  // Cache-first for static assets like icons/manifest
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
 
