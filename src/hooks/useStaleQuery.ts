import { useQuery } from "convex/react";
import { useEffect } from "react";

// Module-level cache that persists across component unmounts
// Uses nested Map: query function -> args string -> cached data
const staleDataCache = new Map<any, Map<string, any>>();

/**
 * Hook that wraps useQuery to return stale data while loading
 * This prevents loading screens when navigating back to a route
 * 
 * Usage:
 * const data = useStaleQuery(api.queries.getDogProfile, { dogId });
 * // data will be the last known value even while loading
 */
export function useStaleQuery(
  query: any,
  args: any
): any {
  // Create a cache key from the args FIRST, before calling useQuery
  // This ensures we can check the cache synchronously
  const argsKey = JSON.stringify(args === "skip" ? "skip" : args || {});
  
  // Get or create the cache for this query function
  if (!staleDataCache.has(query)) {
    staleDataCache.set(query, new Map());
  }
  const queryCache = staleDataCache.get(query)!;
  
  // Check cache BEFORE calling useQuery - this ensures we return cached data immediately
  const cachedData = queryCache.get(argsKey);
  
  // Debug: log cache hits/misses (remove in production)
  if (process.env.NODE_ENV === 'development') {
    try {
      const queryName = typeof query === 'function' ? query.name : String(query);
      if (cachedData !== undefined) {
        console.log(`[useStaleQuery] Cache HIT for ${queryName} with args:`, argsKey);
      } else {
        console.log(`[useStaleQuery] Cache MISS for ${queryName} with args:`, argsKey);
      }
    } catch (e) {
      // Silently fail if logging causes issues
    }
  }
  
  const result = useQuery(query, args);
  
  // Update cache when we get new data
  useEffect(() => {
    if (result !== undefined) {
      queryCache.set(argsKey, result);
    }
  }, [result, argsKey, queryCache]);

  // Return current data if available, otherwise return stale data from cache
  // This means we show the last known data while loading, even after unmounting
  if (result !== undefined) {
    return result;
  }
  
  // Return cached data if available (this will be undefined only on first visit)
  return cachedData;
}

