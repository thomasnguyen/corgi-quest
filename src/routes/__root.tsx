import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { ConvexProvider } from "convex/react";
import * as Sentry from "@sentry/react";
import { useEffect } from "react";

import { convex } from "../lib/convex";
import { ToastProvider } from "../contexts/ToastContext";
import { initSentry } from "../lib/sentry";

import "../styles.css";

// Initialize Sentry as early as possible
initSentry();

// Register service worker for PWA image caching
function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    // Register immediately, don't wait for load event
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[SW] Service Worker registered:", registration.scope);
      })
      .catch((error) => {
        console.warn("[SW] Service Worker registration failed:", error);
      });
  }
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Corgi Quest",
      },
      {
        name: "theme-color",
        content: "#000000",
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "Corgi Quest",
      },
    ],
    links: [
      // iOS Splash Screens - optimized WebP versions
      {
        rel: "apple-touch-startup-image",
        href: "/splash_ios_1290x2796.webp",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        rel: "apple-touch-startup-image",
        href: "/splash_ios_1179x2556.webp",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        rel: "apple-touch-startup-image",
        href: "/splash_ios_1284x2778.webp",
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        rel: "apple-touch-startup-image",
        href: "/splash_ios_1170x2532.webp",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        rel: "apple-touch-startup-image",
        href: "/splash_ios_1242x2688.webp",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        rel: "apple-touch-startup-image",
        href: "/splash_ios_828x1792.webp",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        rel: "apple-touch-startup-image",
        href: "/splash_ios_750x1334.webp",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
      {
        rel: "icon",
        type: "image/webp",
        href: "/favicon.webp",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "apple-touch-icon",
        href: "/logo192.png",
        sizes: "192x192",
      },
      {
        rel: "apple-touch-icon",
        href: "/logo512.png",
        sizes: "512x512",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/backgrounds/bumi_regular.webp",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/backgrounds/bumi_regular_mobile.webp",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/backgrounds/smoke_bg_0.webp",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/backgrounds/smoke_bg_0_mobile.webp",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/backgrounds/mage_bg.webp",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/backgrounds/mage_bg_mobile.webp",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/default_avatar.webp",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/mage_avatar.webp",
        fetchPriority: "high",
      },
      // Preload character avatars for character select screen
      {
        rel: "preload",
        as: "image",
        href: "/holly_avatar.svg",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/thomas_avatar.svg",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/guest_avatar.svg",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/backgrounds/smoke_spark_bg_0.webp",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/backgrounds/smoke_spark_bg_0_mobile.webp",
        fetchPriority: "high",
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Sentry.ErrorBoundary
          fallback={({ error, resetError }) => {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred";
            return (
              <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                  <h1 className="text-2xl font-bold mb-4">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-gray-400 mb-6">
                    We've been notified and are working on a fix.
                  </p>
                  <div className="bg-gray-900 p-4 rounded-lg mb-6 text-left">
                    <p className="text-sm text-red-400 font-mono break-all">
                      {errorMessage}
                    </p>
                  </div>
                  <button
                    onClick={resetError}
                    className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            );
          }}
          showDialog={false}
        >
          <ConvexProvider client={convex}>
            <ToastProvider>
              {children}
              {/*  <TanStackDevtools
                config={{
                  position: "bottom-right",
                }}
                plugins={[
                  {
                    name: "Tanstack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              /> */}
            </ToastProvider>
          </ConvexProvider>
        </Sentry.ErrorBoundary>
        <Scripts />
      </body>
    </html>
  );
}
