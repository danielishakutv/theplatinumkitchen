// Platinum Kitchen service worker.
//
// Deliberately conservative — it never caches pages, API responses, or
// anything authenticated, so there's zero risk of serving stale or
// cross-user content. It does two things:
//   1. Caches content-hashed build assets (/_next/static/*) cache-first.
//   2. Serves a branded offline page when a navigation fails with no network.
//
// Bump CACHE_VERSION to invalidate everything (e.g. after changing /offline).
const CACHE_VERSION = "pk-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.add(OFFLINE_URL))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only ever touch same-origin GETs. Leave POSTs, API calls, auth, and
  // cross-origin requests (Cloudinary images, fonts) completely alone.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: always go to the network for fresh content; only fall back
  // to the cached offline page when there's genuinely no connection.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  // Build assets are content-hashed, so cache-first is permanently safe.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Everything else: straight to the network, no interception.
});
