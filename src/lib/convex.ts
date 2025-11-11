import { ConvexReactClient } from "convex/react";

// Get the Convex URL from environment variables
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Missing VITE_CONVEX_URL environment variable");
  console.error("Available env vars:", Object.keys(import.meta.env));
  throw new Error(
    "Missing VITE_CONVEX_URL environment variable. Add it to Netlify environment variables."
  );
}

console.log("✅ Convex URL configured:", CONVEX_URL);

// Create and export the Convex client
export const convex = new ConvexReactClient(CONVEX_URL);
