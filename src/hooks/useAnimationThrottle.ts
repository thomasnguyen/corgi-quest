import { useRef, useCallback } from "react";

/**
 * Hook to throttle simultaneous animations
 * Requirements: 15.2 - Limit simultaneous animations to 4 or fewer
 */
export function useAnimationThrottle(maxConcurrent: number = 4) {
  const activeAnimations = useRef<Set<string>>(new Set());

  const canAnimate = useCallback(
    (animationId: string): boolean => {
      // If this animation is already active, allow it to continue
      if (activeAnimations.current.has(animationId)) {
        return true;
      }

      // Check if we're at the limit
      if (activeAnimations.current.size >= maxConcurrent) {
        return false;
      }

      return true;
    },
    [maxConcurrent]
  );

  const startAnimation = useCallback((animationId: string) => {
    activeAnimations.current.add(animationId);
  }, []);

  const endAnimation = useCallback((animationId: string) => {
    activeAnimations.current.delete(animationId);
  }, []);

  const getActiveCount = useCallback(() => {
    return activeAnimations.current.size;
  }, []);

  return {
    canAnimate,
    startAnimation,
    endAnimation,
    getActiveCount,
  };
}
