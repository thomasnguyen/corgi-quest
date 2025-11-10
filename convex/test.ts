import { query } from "./_generated/server";

/**
 * Simple test query to verify Convex is working
 */
export const ping = query({
  args: {},
  handler: async () => {
    return { message: "Convex is connected!", timestamp: Date.now() };
  },
});
