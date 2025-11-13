// Enhanced Service Worker for PWA
// Comprehensive caching strategy for optimal performance

const CACHE_VERSION = "v3";
const STATIC_CACHE = `corgi-quest-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `corgi-quest-images-${CACHE_VERSION}`;
const RUNTIME_CACHE = `corgi-quest-runtime-${CACHE_VERSION}`;

// Static assets to cache on install (app shell)
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/favicon.webp",
  "/favicon.png",
  "/logo192.webp",
  "/logo192.png",
  "/logo512.webp",
  "/logo512.png",
  // Splash screens
  "/splash.webp",
  "/splash_ios_1290x2796.webp",
  "/splash_ios_1179x2556.webp",
  "/splash_ios_1284x2778.webp",
  "/splash_ios_1170x2532.webp",
  "/splash_ios_1242x2688.webp",
  "/splash_ios_828x1792.webp",
  "/splash_ios_750x1334.webp",
];

// Images to cache on install (critical images)
const CRITICAL_IMAGES = [
  "/holly_avatar.svg",
  "/thomas_avatar.svg",
  "/guest_avatar.svg",
  "/default_avatar.webp",
  "/default_avatar.png",
  "/mage_avatar.webp",
  "/mage_avatar.png",
  // Optimized background images (replaced 50MB+ SVGs with 4MB WebP)
  "/images/backgrounds/bumi_regular.webp",
  "/images/backgrounds/bumi_regular_mobile.webp",
  "/images/backgrounds/smoke_bg_0.webp",
  "/images/backgrounds/smoke_bg_0_mobile.webp",
  "/images/backgrounds/smoke_spark_bg_0.webp",
  "/images/backgrounds/smoke_spark_bg_0_mobile.webp",
  "/images/backgrounds/mage_bg.webp",
  "/images/backgrounds/mage_bg_mobile.webp",
  "/mage_bg.png",
  "/main_bg.webp",
  "/main_bg.png",
  "/summon.webp",
  "/summon.png",
  "/smoke_spark.webp",
  "/smoke_spark.png",
  "/fire_emblem.svg",
  "/water_emblem.svg",
  "/grass_emblem.svg",
  "/sun_emblem.svg",
  "/earth_emblem.svg",
  "/moon_emblem.svg",
  "/Border.svg",
];

// Install event - cache static assets and critical images
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...", CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("[SW] Caching static assets...");
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("[SW] Some static assets failed to cache:", err);
        });
      }),
      // Cache critical images
      caches.open(IMAGE_CACHE).then((cache) => {
        console.log("[SW] Caching critical images...");
        return Promise.allSettled(
          CRITICAL_IMAGES.map((url) =>
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
      }),
    ])
  );
  // Force activation of new service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...", CACHE_VERSION);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== STATIC_CACHE &&
                name !== IMAGE_CACHE &&
                name !== RUNTIME_CACHE
            )
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Helper: Check if request is for an image
function isImageRequest(url) {
  return (
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".gif") ||
    url.pathname.endsWith(".ico")
  );
}

// Helper: Check if request is for a static asset
function isStaticAsset(url) {
  return (
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".eot")
  );
}

// Helper: Check if request is for API/Convex
function isApiRequest(url) {
  return (
    url.hostname.includes("convex.cloud") ||
    url.hostname.includes("convex.site") ||
    url.pathname.startsWith("/api/")
  );
}

// Fetch event - comprehensive caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests (except images we control)
  if (url.origin !== location.origin && !isImageRequest(url)) {
    return;
  }

  // Strategy 1: Cache First for images (fastest, best UX)
  if (isImageRequest(url)) {
    event.respondWith(
      caches
        .match(request, { cacheName: IMAGE_CACHE })
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Fetch from network and cache
          return fetch(request)
            .then((response) => {
              if (
                response &&
                response.status === 200 &&
                response.type === "basic"
              ) {
                const responseToCache = response.clone();
                caches.open(IMAGE_CACHE).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
              return response;
            })
            .catch(() => {
              // Return a placeholder if network fails and no cache
              return new Response("", { status: 404 });
            });
        })
    );
    return;
  }

  // Strategy 2: Cache First for static assets (CSS, JS, fonts)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches
        .match(request, { cacheName: STATIC_CACHE })
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            if (
              response &&
              response.status === 200 &&
              response.type === "basic"
            ) {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Strategy 3: Network First for API requests (always fresh data)
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request, { cacheName: RUNTIME_CACHE });
        })
    );
    return;
  }

  // Strategy 4: Stale While Revalidate for HTML pages
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      caches.match(request, { cacheName: STATIC_CACHE }).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (
              response &&
              response.status === 200 &&
              response.type === "basic"
            ) {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return (
          caches.match(request, { cacheName: RUNTIME_CACHE }) ||
          caches.match(request, { cacheName: STATIC_CACHE }) ||
          caches.match(request, { cacheName: IMAGE_CACHE })
        );
      })
  );
});
