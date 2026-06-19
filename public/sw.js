// Fluxa service worker — minimal, offline-fallback only.
// It deliberately does NOT precache the app shell or its JS/CSS, so it can
// never serve stale application code. Its only job is to show a branded
// offline page when a navigation fails while the network is unavailable.

const CACHE = "fluxa-offline-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/favicon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intervene for page navigations. All other requests (JS, CSS, API,
  // Supabase, images) pass straight through to the network untouched.
  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(() =>
      caches.match(OFFLINE_URL, { ignoreSearch: true }).then(
        (cached) => cached || new Response("Offline", { status: 503, statusText: "Offline" }),
      ),
    ),
  );
});
