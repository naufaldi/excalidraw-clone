// Empty service worker - prevents 404 errors from browser/extension requests
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
