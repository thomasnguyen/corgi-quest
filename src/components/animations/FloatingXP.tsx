import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * FloatingXP Component
 * Displays animated "+XP" text that floats upward from stat orbs
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.1, 5.2
 */

interface FloatingXPProps {
  amount: number; // XP amount to display
  color: string; // Stat theme color
  startX: number; // Starting X position (px)
  startY: number; // Starting Y position (px)
  onComplete: () => void; // Callback when animation finishes
}

export default function FloatingXP({
  amount,
  color,
  startX,
  startY,
  onComplete,
}: FloatingXPProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Trigger onComplete callback after animation finishes (2s)
  // Requirements: 5.1, 5.2 - Proper cleanup
  useEffect(() => {
    isMountedRef.current = true;

    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onComplete();
      }
    }, 2000);

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [onComplete]);

  // Handle missing document.body gracefully (Requirements: 5.1, 5.2)
  if (typeof document === "undefined" || !document.body) {
    return null;
  }

  // Validate position values (Requirements: 5.1, 5.2)
  const safeX = isFinite(startX) ? startX : 0;
  const safeY = isFinite(startY) ? startY : 0;

  // Render using portal to avoid parent component hierarchy constraints
  return createPortal(
    <div
      className="floating-xp pointer-events-none fixed z-50 text-5xl font-bold"
      style={{
        left: `${safeX}px`,
        top: `${safeY}px`,
        color: color,
        transform: "translate(-50%, -50%)",
        textShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}, 0 4px 8px rgba(0, 0, 0, 0.9)`,
        filter: `drop-shadow(0 0 10px ${color})`,
      }}
    >
      +{amount}
    </div>,
    document.body
  );
}
