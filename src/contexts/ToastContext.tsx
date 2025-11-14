import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Toast, ToastLevel } from "../components/ui/Toast";

interface ToastData {
  id: string;
  message: string;
  level: ToastLevel;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, level: ToastLevel, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider component
 * Manages toast notifications with stacking support
 * Requirements: 21
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  // Track recent toast messages to prevent duplicates
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const showToast = useCallback(
    (message: string, level: ToastLevel, duration?: number) => {
      // If there's already a toast showing, ignore new ones
      if (toasts.length > 0) {
        return;
      }

      const now = Date.now();
      const duplicateWindow = 1000; // 1 second window to prevent duplicates

      // Check if the same message was shown recently
      const lastShown = recentToastsRef.current.get(message);
      if (lastShown && now - lastShown < duplicateWindow) {
        // Duplicate detected within time window, skip
        return;
      }

      // Update the recent toasts map
      recentToastsRef.current.set(message, now);

      // Clean up old entries (older than duplicate window)
      for (const [msg, timestamp] of recentToastsRef.current.entries()) {
        if (now - timestamp > duplicateWindow) {
          recentToastsRef.current.delete(msg);
        }
      }

      const id = `toast-${now}-${Math.random()}`;
      // Only show one toast at a time
      setToasts([{ id, message, level, duration }]);
    },
    [toasts.length]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Render single toast at bottom of screen */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center gap-2 pb-4 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              level={toast.level}
              onDismiss={() => dismissToast(toast.id)}
              duration={toast.duration || 9000}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast context
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
