import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "netlify",
  compatibilityDate: "2025-11-10",
  publicAssets: [
    {
      baseURL: "/",
      dir: "public",
    },
  ],
  // Exclude browser-only packages from server bundle
  // These packages use browser APIs and CommonJS modules that don't work in serverless functions
  // The vite.config.ts ssr.external should handle this, but we configure it here too for Nitro
  // Note: With TanStack Start and Netlify plugin, these should be excluded automatically
  // but we're being explicit here to ensure they're not bundled
});
