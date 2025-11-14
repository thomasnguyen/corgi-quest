import { useEffect } from "react";

export type ToastLevel = "error" | "warning" | "info" | "success";

/**
 * Get timestamp for logging
 */
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().split("T")[1].slice(0, -1); // HH:MM:SS.mmm
};

// Store original console.log to avoid recursion
const originalLog = console.log.bind(console);

/**
 * Log with timestamp
 */
const log = (message: string, ...args: any[]) => {
  originalLog(`[${getTimestamp()}] ${message}`, ...args);
};

interface ToastProps {
  message: string;
  level: ToastLevel;
  onDismiss: () => void;
  duration?: number;
}

/**
 * Toast notification component with 4 levels (error, warning, info, success)
 * Auto-dismisses after specified duration
 * Requirements: 21
 */
export function Toast({
  message,
  level,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  log("[Toast] Rendering toast:", { message, level, duration });

  useEffect(() => {
    log("[Toast] Setting auto-dismiss timer for", duration, "ms");
    const timer = setTimeout(() => {
      log("[Toast] Auto-dismissing toast");
      onDismiss();
    }, duration);

    return () => {
      log("[Toast] Cleaning up timer");
      clearTimeout(timer);
    };
  }, [duration, onDismiss]);

  const getLevelAccent = () => {
    switch (level) {
      case "error":
        return "border-red-500/60";
      case "warning":
        return "border-yellow-500/60";
      case "info":
        return "border-[#d4af37]/60"; // Gold
      case "success":
        return "border-green-500/60"; // Green for partner activities (Requirement 4.8)
      default:
        return "border-[#d4af37]/60"; // Gold
    }
  };

  return (
    <div
      className={`px-4 py-2 rounded-lg shadow-lg bg-[#1a1a1a] border-2 ${getLevelAccent()} max-w-sm mx-auto animate-slide-in`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-white">{message}</p>
        <button
          onClick={onDismiss}
          className="text-base font-bold text-[#d4af37] hover:opacity-80 flex-shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
