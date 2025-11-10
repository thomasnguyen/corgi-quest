import { useEffect, useState } from "react";
import { useConvex } from "convex/react";

/**
 * Connection state for Convex WebSocket
 */
export type ConvexConnectionState =
  | "connected"
  | "disconnected"
  | "reconnecting";

/**
 * Hook to monitor Convex WebSocket connection state
 *
 * Convex handles offline queueing automatically:
 * - Mutations are queued when offline
 * - Mutations are retried when connection is restored
 * - Exponential backoff for reconnection attempts
 *
 * This hook provides visibility into the connection state
 * so we can show appropriate UI indicators.
 *
 * Requirements: 24
 */
export function useConvexConnection() {
  const convex = useConvex();
  const [connectionState, setConnectionState] =
    useState<ConvexConnectionState>("connected");
  const [hasPendingMutations, setHasPendingMutations] = useState(false);

  useEffect(() => {
    // Poll connection state periodically
    // Convex doesn't expose a subscribe API, so we check the state regularly
    const checkConnection = () => {
      const state = convex.connectionState();

      if (state.isWebSocketConnected) {
        setConnectionState("connected");
        // When reconnected, assume pending mutations will sync
        // (Convex handles this automatically)
      } else {
        // Check if we're actively reconnecting
        if (state.hasInflightRequests) {
          setConnectionState("reconnecting");
        } else {
          setConnectionState("disconnected");
        }
      }

      // Track if there are pending mutations
      // When offline, mutations are queued and hasInflightRequests will be true
      setHasPendingMutations(
        state.hasInflightRequests && !state.isWebSocketConnected
      );
    };

    // Check immediately
    checkConnection();

    // Poll every 500ms for connection state changes
    const interval = setInterval(checkConnection, 500);

    return () => {
      clearInterval(interval);
    };
  }, [convex]);

  return {
    connectionState,
    isConnected: connectionState === "connected",
    isReconnecting: connectionState === "reconnecting",
    isDisconnected: connectionState === "disconnected",
    hasPendingMutations,
  };
}
