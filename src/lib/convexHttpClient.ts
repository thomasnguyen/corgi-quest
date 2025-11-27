/**
 * Convex HTTP Client for Server-Side API Routes
 *
 * This client is used in TanStack Start server functions to make
 * server-side queries and mutations to Convex.
 *
 * Requirements: 6.1, 6.2
 */

import { ConvexHttpClient } from "convex/browser";

// Get Convex URL from environment variables
const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "CONVEX_URL not configured. Set VITE_CONVEX_URL or CONVEX_URL environment variable."
  );
}

// Create singleton Convex HTTP client for server-side use
export const convexHttpClient = new ConvexHttpClient(convexUrl);

/**
 * CORS headers for VR app requests
 *
 * Requirements: 6.3
 *
 * Note: In production, replace '*' with specific VR app origin
 * For demo/hackathon purposes, we allow all origins
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400", // 24 hours
};

/**
 * Helper to add CORS headers to response
 */
export function withCorsHeaders(headers: Record<string, string> = {}) {
  return {
    ...corsHeaders,
    ...headers,
  };
}

/**
 * Helper to create a JSON response with CORS headers
 *
 * Note: TanStack Start server functions automatically serialize
 * returned objects to JSON. This helper is for when you need
 * explicit control over headers (e.g., error responses).
 */
export function jsonWithCors<T>(
  data: T,
  options: { status?: number; headers?: Record<string, string> } = {}
) {
  return new Response(JSON.stringify(data), {
    status: options.status || 200,
    headers: withCorsHeaders({
      "Content-Type": "application/json",
      ...options.headers,
    }),
  });
}
