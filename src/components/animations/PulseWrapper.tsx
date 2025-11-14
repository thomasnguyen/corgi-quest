import { ReactNode, useEffect, useState, useRef } from "react";

/**
 * PulseWrapper Component
 * Reusable wrapper that applies pulse animation to children
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.1, 5.2
 */

interface PulseWrapperProps {
  isActive: boolean;
  color: string;
  intensity?: "normal" | "celebration";
  children: ReactNode;
}

export default function PulseWrapper({
  isActive,
  color,
  intensity = "normal",
  children,
}: PulseWrapperProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [lastTrigger, setLastTrigger] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Clear timeout on unmount (Requirements: 5.1, 5.2)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const now = Date.now();
    // Debounce: prevent animation stacking within 1 second
    if (now - lastTrigger < 1000) return;

    setShouldAnimate(true);
    setLastTrigger(now);

    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset animation after it completes (1 second duration)
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setShouldAnimate(false);
      }
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isActive, lastTrigger]);

  const animationClass = shouldAnimate
    ? intensity === "celebration"
      ? ""
      : "animate-pulse-normal"
    : "";

  return (
    <div
      className={animationClass}
      style={
        {
          "--pulse-color": color,
          "--celebration-border":
            shouldAnimate && intensity === "celebration"
              ? color
              : "transparent",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
