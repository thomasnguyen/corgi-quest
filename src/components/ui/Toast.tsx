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

  const getLevelStyles = () => {
    switch (level) {
      case "error":
        return "bg-red-600 text-white";
      case "warning":
        return "bg-yellow-500 text-black";
      case "info":
        return "bg-blue-600 text-white";
      case "success":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div
      className={`px-6 py-3 rounded-lg shadow-lg ${getLevelStyles()} max-w-md mx-auto animate-slide-in`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onDismiss}
          className="text-lg font-bold hover:opacity-80"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
