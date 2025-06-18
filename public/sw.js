// Service Worker for ReBooked Solutions
// Provides offline support and better deployment reliability

const CACHE_NAME = "rebooked-v1";
const OFFLINE_URL = "/offline.html";

// Assets to cache for offline use
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/404.html",
  "/placeholder.svg",
];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching core assets");
        return cache.addAll(CORE_ASSETS);
      })
      .catch((error) => {
        console.error("[SW] Failed to cache core assets:", error);
      }),
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }),
      );
    }),
  );

  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle navigation requests (page loads)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If fetch succeeds, cache the response
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If fetch fails, try cache first, then offline page
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for navigation requests
            return caches.match(OFFLINE_URL);
          });
        }),
    );
    return;
  }

  // Handle asset requests (JS, CSS, images)
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch((error) => {
            console.log("[SW] Asset fetch failed:", request.url, error);
            // For failed asset requests, return a minimal response
            if (request.destination === "image") {
              return new Response("", { status: 204 });
            }
            throw error;
          });
      }),
    );
    return;
  }

  // For other requests, try network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200 && request.method === "GET") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request);
      }),
  );
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case "SKIP_WAITING":
        self.skipWaiting();
        break;
      case "CLEAR_CACHE":
        caches.delete(CACHE_NAME).then(() => {
          console.log("[SW] Cache cleared");
        });
        break;
      case "GET_VERSION":
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
    }
  }
});

// Background sync for when connection is restored
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);
});

// Handle push notifications (if needed in the future)
self.addEventListener("push", (event) => {
  console.log("[SW] Push message received");
});

// Error event
self.addEventListener("error", (event) => {
  console.error("[SW] Service worker error:", event.error);
});

// Unhandled rejection event
self.addEventListener("unhandledrejection", (event) => {
  console.error("[SW] Unhandled promise rejection:", event.reason);
});
