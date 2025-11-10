import { useState, useRef, useCallback, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Connection states for the OpenAI Realtime API WebSocket
 */
export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * OpenAI Realtime API message types
 */
export type RealtimeMessageType =
  | "session.created"
  | "session.updated"
  | "conversation.item.created"
  | "conversation.item.input_audio_transcription.completed"
  | "conversation.item.input_audio_transcription.failed"
  | "response.created"
  | "response.done"
  | "response.output_item.added"
  | "response.output_item.done"
  | "response.content_part.added"
  | "response.content_part.done"
  | "response.text.delta"
  | "response.text.done"
  | "response.audio_transcript.delta"
  | "response.audio_transcript.done"
  | "response.audio.delta"
  | "response.audio.done"
  | "response.function_call_arguments.delta"
  | "response.function_call_arguments.done"
  | "input_audio_buffer.committed"
  | "input_audio_buffer.cleared"
  | "input_audio_buffer.speech_started"
  | "input_audio_buffer.speech_stopped"
  | "rate_limits.updated"
  | "error";

/**
 * OpenAI Realtime API message structure
 */
export interface RealtimeMessage {
  type: RealtimeMessageType;
  event_id?: string;
  [key: string]: any;
}

/**
 * Hook configuration options
 */
export interface UseOpenAIRealtimeOptions {
  onMessage?: (message: RealtimeMessage) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (state: ConnectionState) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

/**
 * Hook return value
 */
export interface UseOpenAIRealtimeReturn {
  connectionState: ConnectionState;
  hasPermission: boolean | null;
  isConnected: boolean;
  requestPermission: () => Promise<boolean>;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  reconnect: () => Promise<void>;
}

/**
 * Custom hook for managing OpenAI Realtime API WebSocket connection
 *
 * Features:
 * - Microphone permission management
 * - WebSocket connection lifecycle
 * - Automatic reconnection with exponential backoff
 * - Message event handling
 * - Error handling
 *
 * @param options Configuration options for the hook
 * @returns Hook interface with connection methods and state
 */
export function useOpenAIRealtime(
  options: UseOpenAIRealtimeOptions = {}
): UseOpenAIRealtimeReturn {
  const {
    onMessage,
    onError,
    onConnectionChange,
    autoReconnect = true,
    maxReconnectAttempts = 5,
  } = options;

  // State
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualDisconnectRef = useRef(false);

  // Convex action for generating session token
  const generateToken = useAction(api.actions.generateSessionToken);

  /**
   * Update connection state and notify listeners
   */
  const updateConnectionState = useCallback(
    (newState: ConnectionState) => {
      setConnectionState(newState);
      onConnectionChange?.(newState);
    },
    [onConnectionChange]
  );

  /**
   * Request microphone permission from the user
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop all tracks immediately - we just needed to check permission
      stream.getTracks().forEach((track) => track.stop());

      setHasPermission(true);
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setHasPermission(false);

      const permissionError = new Error(
        "Microphone access is required for voice logging. Please enable microphone permissions in your browser settings."
      );
      onError?.(permissionError);

      return false;
    }
  }, [onError]);

  /**
   * Calculate exponential backoff delay for reconnection attempts
   */
  const getReconnectDelay = useCallback((attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
    return delay;
  }, []);

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data);

        // Log message for debugging
        console.log("[OpenAI Realtime]", message.type, message);

        // Handle specific message types
        switch (message.type) {
          case "session.created":
            console.log("Session created successfully");
            updateConnectionState("connected");
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
            break;

          case "error":
            console.error("OpenAI Realtime API error:", message);
            const error = new Error(
              message.error?.message || "Unknown OpenAI error"
            );
            onError?.(error);
            break;
        }

        // Notify message listener
        onMessage?.(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        onError?.(error as Error);
      }
    },
    [onMessage, onError, updateConnectionState]
  );

  /**
   * Handle WebSocket errors
   */
  const handleError = useCallback(
    (event: Event) => {
      console.error("WebSocket error:", event);
      updateConnectionState("error");

      const error = new Error("WebSocket connection error occurred");
      onError?.(error);
    },
    [onError, updateConnectionState]
  );

  /**
   * Handle WebSocket close events
   */
  const handleClose = useCallback(
    (event: CloseEvent) => {
      console.log("WebSocket closed:", event.code, event.reason);

      wsRef.current = null;

      // Only attempt reconnection if:
      // 1. Auto-reconnect is enabled
      // 2. It wasn't a manual disconnect
      // 3. We haven't exceeded max attempts
      if (
        autoReconnect &&
        !isManualDisconnectRef.current &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        const delay = getReconnectDelay(reconnectAttemptsRef.current);
        console.log(
          `Attempting reconnection ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts} in ${delay}ms`
        );

        updateConnectionState("disconnected");

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        updateConnectionState("disconnected");

        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          const error = new Error(
            `Failed to reconnect after ${maxReconnectAttempts} attempts`
          );
          onError?.(error);
        }
      }
    },
    [
      autoReconnect,
      maxReconnectAttempts,
      getReconnectDelay,
      onError,
      updateConnectionState,
    ]
  );

  /**
   * Connect to OpenAI Realtime API
   */
  const connect = useCallback(async () => {
    // Check if already connected or connecting
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      connectionState === "connecting"
    ) {
      console.log("Already connected or connecting");
      return;
    }

    // Check microphone permission first
    if (hasPermission === null) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    } else if (hasPermission === false) {
      const error = new Error("Microphone permission required");
      onError?.(error);
      return;
    }

    try {
      updateConnectionState("connecting");
      isManualDisconnectRef.current = false;

      // Generate session token from Convex
      console.log("Generating OpenAI session token...");
      const sessionToken = await generateToken();

      if (!sessionToken) {
        throw new Error("Failed to generate session token");
      }

      console.log(
        "Session token generated, establishing WebSocket connection..."
      );

      // Create WebSocket connection
      const ws = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
        [
          "realtime",
          `openai-insecure-api-key.${sessionToken}`,
          "openai-beta.realtime-v1",
        ]
      );

      // Set up event listeners
      ws.onopen = () => {
        console.log("WebSocket connection opened");
        // Connection state will be updated to "connected" when we receive session.created
      };

      ws.onmessage = handleMessage;
      ws.onerror = handleError;
      ws.onclose = handleClose;

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect to OpenAI Realtime API:", error);
      updateConnectionState("error");
      onError?.(error as Error);
    }
  }, [
    connectionState,
    hasPermission,
    requestPermission,
    generateToken,
    handleMessage,
    handleError,
    handleClose,
    onError,
    updateConnectionState,
  ]);

  /**
   * Disconnect from OpenAI Realtime API
   */
  const disconnect = useCallback(() => {
    console.log("Manually disconnecting from OpenAI Realtime API");

    isManualDisconnectRef.current = true;

    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    updateConnectionState("disconnected");
    reconnectAttemptsRef.current = 0;
  }, [updateConnectionState]);

  /**
   * Send a message through the WebSocket connection
   */
  const sendMessage = useCallback(
    (message: any) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error("Cannot send message: WebSocket not connected");
        return;
      }

      try {
        const messageStr =
          typeof message === "string" ? message : JSON.stringify(message);
        wsRef.current.send(messageStr);
      } catch (error) {
        console.error("Failed to send message:", error);
        onError?.(error as Error);
      }
    },
    [onError]
  );

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(async () => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    await connect();
  }, [disconnect, connect]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Close WebSocket connection
      if (wsRef.current) {
        isManualDisconnectRef.current = true;
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, []);

  return {
    connectionState,
    hasPermission,
    isConnected: connectionState === "connected",
    requestPermission,
    connect,
    disconnect,
    sendMessage,
    reconnect,
  };
}
