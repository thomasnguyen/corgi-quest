// Service Worker for PWA Image Caching
// Caches images for offline use and faster subsequent loads

const CACHE_NAME = "corgi-quest-images-v1";
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Images to cache on install
const IMAGES_TO_CACHE = [
  "/holly_avatar.svg",
  "/thomas_avatar.svg",
  "/guest_avatar.svg",
  "/default_avatar.webp",
  "/default_avatar.png",
  "/mage_avatar.webp",
  "/mage_avatar.png",
  "/smoke_spark_bg.svg",
  "/smoke_bg.svg",
  "/mage_bg.webp",
  "/mage_bg.png",
  "/main_bg.webp",
  "/main_bg.png",
];

// Install event - cache images
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching images...");
      // Cache images, but don't fail if some are missing
      return Promise.allSettled(
        IMAGES_TO_CACHE.map((url) =>
          fetch(url)
            .then((response) => {
              if (response.ok) {
                return cache.put(url, response);
              }
            })
            .catch((err) => {
              console.warn(`[SW] Failed to cache ${url}:`, err);
            })
        )
      );
    })
  );
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle image requests
  if (
    event.request.method === "GET" &&
    (url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".webp") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".jpeg"))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network and cache it
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // If network fails and we have a cached version, return it
            return caches.match(event.request);
          });
      })
    );
  }
});
