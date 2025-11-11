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
});
