import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    netlify(),
    viteReact(),
  ],
  optimizeDeps: {
    include: [
      "@pipecat-ai/client-js",
      "@pipecat-ai/client-react",
      "@pipecat-ai/voice-ui-kit",
      "@pipecat-ai/daily-transport",
      "@pipecat-ai/small-webrtc-transport",
      "@daily-co/daily-js",
      "three",
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  server: {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
    watch: {
      ignored: ["**/.nitro/**", "**/.output/**", "**/.tanstack/**"],
    },
  },
});

export default config;
