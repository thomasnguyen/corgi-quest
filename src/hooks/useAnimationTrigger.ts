import { useEffect, useRef } from "react";
import { usePreviousValue } from "./usePreviousValue";

interface AnimationTriggerOptions {
  skipInitial?: boolean; // Don't trigger on component mount
  debounce?: number; // Debounce time in ms
}

/**
 * Hook that compares current vs previous values and triggers callback on change
 * Includes skipInitial option to prevent triggering on component mount
 * Includes debounce option to prevent animation spam
 * Requirements: 5.3, 5.4, 5.5, 5.6, 5.7
 */
export function useAnimationTrigger<T>(
  currentValue: T,
  onTrigger: (previous: T | undefined, current: T) => void,
  options: AnimationTriggerOptions = {}
): void {
  const { skipInitial = true, debounce = 0 } = options;
  const previousValue = usePreviousValue(currentValue);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip initial mount if configured
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (skipInitial) {
        return;
      }
    }

    // Skip if no change
    if (previousValue === currentValue) {
      return;
    }

    // Debounce if configured
    if (debounce > 0) {
      const timeoutId = setTimeout(() => {
        onTrigger(previousValue, currentValue);
      }, debounce);

      return () => clearTimeout(timeoutId);
    } else {
      onTrigger(previousValue, currentValue);
    }
  }, [currentValue, previousValue, onTrigger, skipInitial, debounce]);
}
