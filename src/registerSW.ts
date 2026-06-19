// Registers the Fluxa service worker for offline support. The worker only
// provides an offline fallback page; it never caches app code, so it cannot
// serve stale builds. Registration is best-effort and silently no-ops where
// service workers are unavailable (e.g. iOS private browsing, older browsers).
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Offline support is a progressive enhancement; ignore failures.
    });
  });
}
