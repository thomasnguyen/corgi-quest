import { useRef, useEffect } from "react";

/**
 * Hook that tracks and returns the previous value of any variable
 * Handles initial mount case where previous value is undefined
 * Requirements: 5.3, 5.4, 5.5
 */
export function usePreviousValue<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
