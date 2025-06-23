// Service Worker for ReBooked Solutions
// Implements caching strategies for better performance

const CACHE_NAME = "rebooked-v1.0.0";
const STATIC_CACHE = "rebooked-static-v1";
const DYNAMIC_CACHE = "rebooked-dynamic-v1";
const IMAGE_CACHE = "rebooked-images-v1";

// Files to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/offline.html",
  "/university-logos/default.svg",
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first, fallback to network
  CACHE_FIRST: "cache-first",
  // Network first, fallback to cache
  NETWORK_FIRST: "network-first",
  // Always network, update cache
  NETWORK_ONLY: "network-only",
  // Cache only
  CACHE_ONLY: "cache-only",
  // Stale while revalidate
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("📦 Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("✅ Static assets cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Failed to cache static assets:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("✅ Service Worker activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith("http")) {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // API requests - Network first
    if (url.pathname.includes("/api/") || url.hostname.includes("supabase")) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }

    // Images - Cache first with long expiry
    if (
      request.destination === "image" ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)
    ) {
      return await cacheFirst(request, IMAGE_CACHE);
    }

    // Static assets (JS, CSS) - Cache first
    if (
      request.destination === "script" ||
      request.destination === "style" ||
      url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)
    ) {
      return await cacheFirst(request, STATIC_CACHE);
    }

    // HTML pages - Stale while revalidate
    if (
      request.destination === "document" ||
      request.headers.get("Accept")?.includes("text/html")
    ) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }

    // Default: Network first
    return await networkFirst(request, DYNAMIC_CACHE);
  } catch (error) {
    console.error("❌ Request failed:", error);
    return await handleOffline(request);
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Return cached version immediately
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Cache first failed:", error);
    throw error;
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Update cache with fresh data
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Start network request (don't await)
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, but we might have cache
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Wait for network if no cache
  return await networkPromise;
}

// Handle offline scenarios
async function handleOffline(request) {
  const url = new URL(request.url);

  // For HTML requests, return offline page
  if (
    request.destination === "document" ||
    request.headers.get("Accept")?.includes("text/html")
  ) {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match("/offline.html");
  }

  // For images, return placeholder
  if (request.destination === "image") {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match("/placeholder.svg");
  }

  // Return a custom offline response
  return new Response(
    JSON.stringify({
      error: "Offline",
      message: "You are currently offline. Please check your connection.",
    }),
    {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "application/json" },
    },
  );
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("🔄 Background sync triggered");
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle queued offline actions
  try {
    // Implement your background sync logic here
    console.log("✅ Background sync completed");
  } catch (error) {
    console.error("❌ Background sync failed:", error);
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: data.data,
    actions: data.actions,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(self.clients.openWindow(event.notification.data?.url || "/"));
});

console.log("✅ Service Worker loaded");
