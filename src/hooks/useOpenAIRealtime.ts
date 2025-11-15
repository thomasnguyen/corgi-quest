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
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

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
    console.log("[OpenAI Realtime] connect() called");

    // Check if already connected or connecting
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      connectionState === "connecting"
    ) {
      console.log("[OpenAI Realtime] Already connected or connecting");
      return;
    }

    // Check microphone permission first
    if (hasPermission === null) {
      console.log("[OpenAI Realtime] Requesting microphone permission...");
      const granted = await requestPermission();
      if (!granted) {
        console.log("[OpenAI Realtime] Microphone permission denied");
        return;
      }
    } else if (hasPermission === false) {
      console.log("[OpenAI Realtime] Microphone permission already denied");
      const error = new Error("Microphone permission required");
      onError?.(error);
      return;
    }

    try {
      updateConnectionState("connecting");
      isManualDisconnectRef.current = false;

      // Generate session token from Convex
      console.log("[OpenAI Realtime] Generating OpenAI session token...");
      const sessionToken = await generateToken();
      console.log(
        "[OpenAI Realtime] ✅ Session token generated:",
        sessionToken?.substring(0, 20) + "..."
      );

      if (!sessionToken) {
        throw new Error("Failed to generate session token");
      }

      console.log(
        "[OpenAI Realtime] Session token generated, establishing WebSocket connection..."
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
        console.log("[OpenAI Realtime] 🔌 WebSocket connection opened!");
        // Start audio capture when connection opens
        startAudioCapture();
        // Connection state will be updated to "connected" when we receive session.created
      };

      ws.onmessage = handleMessage;
      ws.onerror = handleError;
      ws.onclose = handleClose;

      wsRef.current = ws;
    } catch (error) {
      console.error("[OpenAI Realtime] ❌ Failed to connect:", error);
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
    console.log("[OpenAI Realtime] Manually disconnecting");

    isManualDisconnectRef.current = true;

    // Stop audio capture first
    stopAudioCapture();

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
   * Start capturing microphone audio and sending to OpenAI
   */
  const startAudioCapture = useCallback(async () => {
    try {
      console.log("[OpenAI Realtime] Starting audio capture...");

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      // Create source from microphone
      const source = audioContext.createMediaStreamSource(stream);

      // Create script processor for audio processing
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Handle audio data
      processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);

        // Convert float32 to int16
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert to base64
        const base64Audio = btoa(
          String.fromCharCode.apply(null, Array.from(int16Data))
        );

        // Send to OpenAI
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "input_audio_buffer.append",
              audio: base64Audio,
            })
          );
        }
      };

      // Connect nodes
      source.connect(processor);
      processor.connect(audioContext.destination);

      console.log("[OpenAI Realtime] ✅ Audio capture started");
    } catch (error) {
      console.error("[OpenAI Realtime] Failed to start audio capture:", error);
      onError?.(error as Error);
    }
  }, [onError]);

  /**
   * Stop audio capture
   */
  const stopAudioCapture = useCallback(() => {
    console.log("[OpenAI Realtime] Stopping audio capture...");

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    console.log("[OpenAI Realtime] Audio capture stopped");
  }, []);

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
      // Stop audio capture
      stopAudioCapture();

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
  }, [stopAudioCapture]);

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
