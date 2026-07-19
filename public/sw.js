// Minimal service worker. This app's data (classmates, faculty, materials,
// notices) changes often via the admin panel, so we intentionally avoid
// caching API responses or pages — we only register a fetch handler because
// Chrome/Android requires one to be present for the "Install app" prompt to
// show up. Everything still goes straight to the network.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
