import { useCallback, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { lightenColor } from "../lib/animationUtils";

/**
 * Custom hook for triggering confetti animations
 * Requirements: 3.9, 3.10, 5.1, 5.2, 5.7
 */

interface StatConfettiOptions {
  color: string;
  originX: number; // Normalized 0-1
  originY: number; // Normalized 0-1
}

export function useConfetti() {
  // Track active confetti to prevent simultaneous triggers (Requirements: 5.7)
  const overallConfettiActive = useRef(false);
  const statConfettiQueue = useRef<StatConfettiOptions[]>([]);
  const statConfettiActive = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup on unmount (Requirements: 5.1, 5.2)
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      overallConfettiActive.current = false;
      statConfettiActive.current = false;
      statConfettiQueue.current = [];
    };
  }, []);

  /**
   * Trigger overall level-up confetti
   * Requirements: 3.1, 3.3, 3.5, 3.6, 5.1, 5.2, 5.7
   */
  const triggerOverallConfetti = useCallback(() => {
    // If confetti is already active, skip to prevent overlap
    if (overallConfettiActive.current) {
      return;
    }

    overallConfettiActive.current = true;
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ["#f5c35f", "#fcd587", "#fff1ab"];

    const frame = () => {
      try {
        confetti({
          particleCount: 5, // Reduced from 50 to 5 (10%)
          spread: 70,
          origin: { y: 0.6 },
          colors: colors,
          ticks: 200,
          gravity: 1,
          decay: 0.94,
          startVelocity: 30,
        });

        if (Date.now() < animationEnd) {
          animationFrameRef.current = requestAnimationFrame(frame);
        } else {
          overallConfettiActive.current = false;
          animationFrameRef.current = null;
        }
      } catch (error) {
        console.error("Error triggering confetti:", error);
        overallConfettiActive.current = false;
        animationFrameRef.current = null;
      }
    };

    frame();
  }, []);

  /**
   * Process queued stat confetti
   * Requirements: 5.1, 5.2, 5.7
   */
  const processStatConfettiQueue = useCallback(() => {
    if (statConfettiActive.current || statConfettiQueue.current.length === 0) {
      return;
    }

    statConfettiActive.current = true;
    const options = statConfettiQueue.current.shift()!;

    try {
      const colors = [options.color, lightenColor(options.color, 20)];

      confetti({
        particleCount: 3, // Reduced from 25 to 3 (12%)
        spread: 50,
        origin: { x: options.originX, y: options.originY },
        colors: colors,
        ticks: 200,
        gravity: 1,
        decay: 0.94,
        startVelocity: 25,
      });

      // Allow next confetti after 500ms
      // Clear existing timeout if any
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        statConfettiActive.current = false;
        timeoutRef.current = null;
        processStatConfettiQueue();
      }, 500);
    } catch (error) {
      console.error("Error processing stat confetti:", error);
      statConfettiActive.current = false;
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Trigger stat level-up confetti
   * Requirements: 3.2, 3.4, 3.5, 3.7, 5.7
   */
  const triggerStatConfetti = useCallback(
    (options: StatConfettiOptions) => {
      // Queue confetti if multiple level-ups occur simultaneously
      statConfettiQueue.current.push(options);
      processStatConfettiQueue();
    },
    [processStatConfettiQueue]
  );

  return {
    triggerOverallConfetti,
    triggerStatConfetti,
  };
}
