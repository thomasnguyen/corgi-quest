import { ConvexReactClient } from "convex/react";

// Get the Convex URL from environment variables
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  throw new Error(
    "Missing VITE_CONVEX_URL environment variable. Run `npx convex dev` to set it up."
  );
}

// Create and export the Convex client
export const convex = new ConvexReactClient(CONVEX_URL);
