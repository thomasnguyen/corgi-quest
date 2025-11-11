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
  // Note: Browser-only packages are excluded via Vite SSR config
  // to prevent CommonJS/ESM import issues in serverless functions
});
