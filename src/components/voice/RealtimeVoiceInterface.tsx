import { CircularWaveform } from "@pipecat-ai/voice-ui-kit";
import { useOpenAIRealtime } from "../../hooks/useOpenAIRealtime";
import { useEffect, useState, useRef } from "react";
import {
  OPENAI_SYSTEM_INSTRUCTIONS,
  SAVE_ACTIVITY_FUNCTION_DEFINITION,
} from "../../lib/openaiSystemInstructions";
import type { RealtimeMessage } from "../../hooks/useOpenAIRealtime";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Toast } from "../ui/Toast";
import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, Eye, X } from "lucide-react";

/**
 * Get timestamp for logging
 */
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().split("T")[1].slice(0, -1); // HH:MM:SS.mmm
};

// Store original console methods to avoid recursion
const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);

/**
 * Log with timestamp
 */
const log = (message: string, ...args: any[]) => {
  originalLog(`[${getTimestamp()}] ${message}`, ...args);
};

const logError = (message: string, ...args: any[]) => {
  originalError(`[${getTimestamp()}] ${message}`, ...args);
};

const logWarn = (message: string, ...args: any[]) => {
  originalWarn(`[${getTimestamp()}] ${message}`, ...args);
};

/**
 * Conversation states for the voice interface
 */
type ConversationState = "idle" | "listening" | "processing" | "speaking";

interface RealtimeVoiceInterfaceProps {
  questName?: string;
  onActivitySaved?: (activityId: string) => void;
  onError?: (error: Error) => void;
}

interface SaveActivityParams {
  activityName: string;
  durationMinutes?: number;
  statGains: Array<{
    statType: "INT" | "PHY" | "IMP" | "SOC";
    xpAmount: number;
  }>;
  physicalPoints: number;
  mentalPoints: number;
}

interface SavedActivityInfo {
  activityId: string;
  activityName: string;
  totalXpGained: number;
  statGains: Array<{
    statType: "INT" | "PHY" | "IMP" | "SOC";
    xpAmount: number;
  }>;
  levelUps: Array<{
    statType: string;
    oldLevel: number;
    newLevel: number;
  }>;
}

/**
 * Voice interface component for logging activities using OpenAI Realtime API.
 *
 * Features:
 * - Microphone permission management
 * - Session token generation via Convex action
 * - WebSocket connection to OpenAI Realtime API
 * - Session configuration with system instructions and function definition
 * - Connection status display
 * - Audio visualization with VoiceVisualizer
 *
 * Requirements: 7, 20, 24
 */
export function RealtimeVoiceInterface({
  questName,
  onActivitySaved,
  onError,
}: RealtimeVoiceInterfaceProps) {
  const navigate = useNavigate();
  const [sessionConfigured, setSessionConfigured] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isListeningSmoothed, setIsListeningSmoothed] = useState(false);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [conversationState, setConversationState] =
    useState<ConversationState>("idle");
  const [savedActivity, setSavedActivity] = useState<SavedActivityInfo | null>(
    null
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Track if recording has been started to prevent double-start in strict mode
  const recordingStartedRef = useRef(false);

  // Track when listening started to enforce minimum duration
  const listeningStartTimeRef = useRef<number | null>(null);

  // Get dog and user IDs for activity logging
  const firstDog = useQuery(api.queries.getFirstDog);
  const dogId = firstDog?._id;

  // Get first user for demo purposes (in real app, this would come from auth)
  const firstUser = useQuery(
    api.queries.getFirstUser,
    firstDog?.householdId ? { householdId: firstDog.householdId } : "skip"
  );
  const userId = firstUser?._id;

  /**
   * Convex mutation for logging activities with optimistic updates.
   *
   * Optimistic updates provide instant UI feedback by immediately updating the local cache
   * before the server confirms the mutation. This makes the app feel fast and responsive.
   *
   * How it works:
   * 1. When OpenAI calls saveActivity, we immediately add the activity to the local feed
   * 2. The activity appears at the top of the feed instantly (before server confirmation)
   * 3. Convex automatically reconciles with the server response when it arrives
   * 4. If the mutation fails, Convex automatically rolls back the optimistic update
   *
   * Requirements: 23
   */
  const logActivityMutation = useMutation(
    api.mutations.logActivity
  ).withOptimisticUpdate((localStore, args) => {
    // Get the current activity feed from local cache
    const currentFeed = localStore.getQuery(api.queries.getActivityFeed, {
      dogId: args.dogId,
    });

    if (currentFeed) {
      // Create optimistic activity entry with full stat gains structure
      const optimisticStatGains = args.statGains.map((gain, index) => ({
        _id: `optimistic-stat-${Date.now()}-${index}` as any,
        _creationTime: Date.now(),
        activityId: `optimistic-${Date.now()}` as any,
        statType: gain.statType,
        xpAmount: gain.xpAmount,
      }));

      const optimisticActivity = {
        _id: `optimistic-${Date.now()}` as any, // Temporary ID
        _creationTime: Date.now(),
        dogId: args.dogId,
        userId: args.userId,
        activityName: args.activityName,
        description: args.description,
        durationMinutes: args.durationMinutes,
        createdAt: Date.now(),
        userName: firstUser?.name || "You", // Use current user's name
        statGains: optimisticStatGains,
      };

      // Add optimistic activity to the top of the feed
      localStore.setQuery(api.queries.getActivityFeed, { dogId: args.dogId }, [
        optimisticActivity,
        ...currentFeed,
      ]);
    }
  });

  // Track current function call for response handling
  const currentFunctionCallRef = useRef<{
    callId: string;
    name: string;
    arguments: string;
  } | null>(null);

  // Track audio chunks sent for debugging
  const audioChunksSentRef = useRef(0);

  // Audio refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const {
    connectionState,
    hasPermission,
    isConnected,
    requestPermission,
    connect,
    disconnect,
    sendMessage,
  } = useOpenAIRealtime({
    onError: (error) => {
      logError("[Voice] OpenAI error:", error);
      onError?.(error);
    },
    onMessage: (message: RealtimeMessage) => {
      handleRealtimeMessage(message);
    },
    onConnectionChange: (state) => {
      log("[Voice] Connection state:", state);

      // Reset session configured flag when disconnected
      if (state === "disconnected" || state === "error") {
        setSessionConfigured(false);
        setConversationState("idle");
        stopRecording();
      }
    },
  });

  // Use refs for connection state to avoid stale closures in audio processor
  const isConnectedRef = useRef(isConnected);
  const sessionConfiguredRef = useRef(sessionConfigured);

  // Keep refs in sync with state
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    sessionConfiguredRef.current = sessionConfigured;
  }, [sessionConfigured]);

  /**
   * Convert Float32Array audio data to PCM16 format
   */
  const floatTo16BitPCM = (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp values to [-1, 1] range
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      // Convert to 16-bit PCM
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  };

  /**
   * Convert Int16Array to base64 string for WebSocket transmission
   */
  const int16ToBase64 = (int16Array: Int16Array): string => {
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  };

  /**
   * Start capturing microphone audio and streaming to OpenAI
   */
  const startRecording = async () => {
    try {
      log("[Voice] Starting audio recording");

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;

      // Set audio track for visualizer
      const track = stream.getAudioTracks()[0];
      if (track) {
        setAudioTrack(track);
      }

      // Create audio context with 24kHz sample rate
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // Create script processor for audio processing
      // Buffer size of 4096 provides good balance between latency and processing
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isConnectedRef.current || !sessionConfiguredRef.current) {
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);

        // Convert to PCM16
        const pcm16Data = floatTo16BitPCM(inputData);

        // Convert to base64 and send to OpenAI
        const base64Audio = int16ToBase64(pcm16Data);

        sendMessage({
          type: "input_audio_buffer.append",
          audio: base64Audio,
        });

        audioChunksSentRef.current++;
      };

      // Connect audio nodes
      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      log("[Voice] Recording started");
    } catch (error) {
      logError("[Voice] Failed to start recording:", error);
      onError?.(
        new Error(
          "Failed to start audio recording. Please check microphone permissions."
        )
      );
    }
  };

  /**
   * Stop capturing microphone audio
   */
  const stopRecording = () => {
    // Stop all media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Clear audio track for visualizer
    setAudioTrack(null);

    // Disconnect and close audio nodes
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Reset audio chunks counter
    audioChunksSentRef.current = 0;

    setIsRecording(false);
  };

  /**
   * Stop the conversation and clear audio queue
   */
  const stopConversation = () => {
    // Clear audio queue to stop any pending playback
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    // Clear any function call in progress
    currentFunctionCallRef.current = null;

    // Send cancel event to OpenAI to interrupt response
    if (isConnected && sessionConfigured) {
      sendMessage({
        type: "response.cancel",
      });
    }

    // Reset conversation state
    setConversationState("idle");
    setIsListening(false);
  };

  /**
   * Reset interface for logging another activity
   * Keeps WebSocket connection open for seamless consecutive logging
   */
  const handleLogAnother = () => {
    // Clear saved activity info
    setSavedActivity(null);

    // Reset conversation state to idle
    setConversationState("idle");
    setIsListening(false);

    // Clear audio queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    // Clear any function call in progress
    currentFunctionCallRef.current = null;
  };

  /**
   * Navigate to activity feed
   */
  const handleViewFeed = () => {
    navigate({ to: "/activity" });
  };

  /**
   * Play audio response from OpenAI
   */
  const playAudioChunk = async (base64Audio: string) => {
    try {
      // Decode base64 to binary
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to Int16Array (PCM16 format)
      const int16Array = new Int16Array(bytes.buffer);

      // Add to queue
      audioQueueRef.current.push(int16Array);

      // Start playing if not already playing
      if (!isPlayingRef.current) {
        playAudioQueue();
      }
    } catch (error) {
      logError("[Voice] Failed to play audio:", error);
      onError?.(new Error("Failed to play audio response"));
    }
  };

  /**
   * Play queued audio chunks
   */
  const playAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;

    try {
      // Create audio context for playback
      const audioContext = new AudioContext({ sampleRate: 24000 });

      while (audioQueueRef.current.length > 0) {
        const int16Array = audioQueueRef.current.shift()!;

        // Convert Int16Array to Float32Array for Web Audio API
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] =
            int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
        }

        // Create audio buffer
        const audioBuffer = audioContext.createBuffer(
          1,
          float32Array.length,
          24000
        );
        audioBuffer.getChannelData(0).set(float32Array);

        // Create buffer source and play
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        // Wait for audio to finish playing
        await new Promise<void>((resolve) => {
          source.onended = () => {
            resolve();
          };
          source.start();
        });
      }

      await audioContext.close();
    } catch (error) {
      logError("[Voice] Error playing audio queue:", error);
    } finally {
      isPlayingRef.current = false;
    }
  };

  /**
   * Handle function call from OpenAI
   */
  const handleFunctionCall = async (
    callId: string,
    name: string,
    argumentsJson: string
  ) => {
    try {
      // Parse function arguments
      const params: SaveActivityParams = JSON.parse(argumentsJson);

      // Validate required parameters
      if (!params.activityName) {
        throw new Error("Missing required parameter: activityName");
      }

      if (!params.statGains || params.statGains.length === 0) {
        throw new Error("Missing required parameter: statGains");
      }

      if (
        params.physicalPoints === undefined ||
        params.mentalPoints === undefined
      ) {
        throw new Error(
          "Missing required parameters: physicalPoints or mentalPoints"
        );
      }

      // Validate dogId and userId are available
      if (!dogId || !userId) {
        throw new Error("Dog or user information not available");
      }

      log("[Voice] Calling mutation with params:", {
        activityName: params.activityName,
        statGains: params.statGains,
      });

      // Call logActivity mutation
      const result = await logActivityMutation({
        dogId,
        userId,
        activityName: params.activityName,
        description: undefined,
        durationMinutes: params.durationMinutes,
        statGains: params.statGains,
        physicalPoints: params.physicalPoints,
        mentalPoints: params.mentalPoints,
      });

      log("[Voice] 🎉 MUTATION SUCCESS:", {
        activityId: result.activityId,
        totalXpGained: result.totalXpGained,
        levelUps: result.levelUps,
      });

      // Store saved activity info for confirmation display
      setSavedActivity({
        activityId: result.activityId,
        activityName: params.activityName,
        totalXpGained: result.totalXpGained,
        statGains: params.statGains,
        levelUps: result.levelUps,
      });

      // Show toast notification
      setToastMessage(`Activity logged! +${result.totalXpGained} XP earned`);
      setShowToast(true);

      // Show level-up toasts for each level-up
      if (result.levelUps && result.levelUps.length > 0) {
        result.levelUps.forEach((levelUp, index) => {
          // Delay each toast slightly to stack them nicely
          setTimeout(
            () => {
              const statName =
                levelUp.statType === "OVERALL" ? "Overall" : levelUp.statType;
              setToastMessage(
                `🎉 ${statName} leveled up to ${levelUp.newLevel}!`
              );
              setShowToast(true);
            },
            (index + 1) * 500
          ); // 500ms delay between each level-up toast
        });
      }

      // Send success response back to OpenAI
      sendMessage({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify({
            success: true,
            activityId: result.activityId,
            totalXpGained: result.totalXpGained,
            levelUps: result.levelUps,
          }),
        },
      });

      // Trigger OpenAI to generate a response after function call
      sendMessage({
        type: "response.create",
      });

      // Notify parent component
      if (onActivitySaved && result.activityId) {
        onActivitySaved(result.activityId);
      }
    } catch (error) {
      logError("[Voice] Function call failed:", error);

      // Send error response back to OpenAI
      sendMessage({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify({
            success: false,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          }),
        },
      });

      // Trigger OpenAI to generate a response after function call error
      sendMessage({
        type: "response.create",
      });

      // Notify parent component of error
      onError?.(
        error instanceof Error ? error : new Error("Failed to save activity")
      );
    }
  };

  /**
   * Handle incoming messages from OpenAI Realtime API
   */
  const handleRealtimeMessage = (message: RealtimeMessage) => {
    switch (message.type) {
      case "session.created":
        log("[Voice] Session created, configuring...");
        configureSession();
        break;

      case "session.updated":
        log("[Voice] Session configured");
        setSessionConfigured(true);
        // Start recording once session is configured (only once)
        if (!recordingStartedRef.current) {
          recordingStartedRef.current = true;
          startRecording();

          // If quest name is provided, send initial context message to OpenAI
          if (questName) {
            log("[Voice] Sending quest context to OpenAI:", questName);
            // Send a conversation item to provide context about the quest
            sendMessage({
              type: "conversation.item.create",
              item: {
                type: "message",
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: `I want to complete the quest: ${questName}`,
                  },
                ],
              },
            });

            // Trigger OpenAI to respond to the quest context
            sendMessage({
              type: "response.create",
            });
          }
        }
        break;

      case "response.audio.delta":
        // Receive audio response from OpenAI
        if (message.delta) {
          playAudioChunk(message.delta);
        }
        // Set listening to false when OpenAI is speaking
        setIsListening(false);
        setConversationState("speaking");
        break;

      case "response.audio.done":
        // Wait for audio queue to finish playing before changing state
        // Check if audio is still playing, if so wait for it to finish
        const checkAudioFinished = () => {
          if (isPlayingRef.current || audioQueueRef.current.length > 0) {
            // Audio still playing, check again in 100ms
            setTimeout(checkAudioFinished, 100);
          } else {
            // Audio finished, now we can change state to idle
            setConversationState("idle");
          }
        };
        checkAudioFinished();
        break;

      case "response.function_call_arguments.delta":
        // Accumulate function call arguments as they stream in
        setConversationState("processing");

        if (message.call_id) {
          if (
            !currentFunctionCallRef.current ||
            currentFunctionCallRef.current.callId !== message.call_id
          ) {
            // New function call - initialize with empty arguments
            // The name will come from response.function_call_arguments.done
            log("[Voice] 🎯 Function call started, callId:", message.call_id);
            currentFunctionCallRef.current = {
              callId: message.call_id,
              name: "", // Will be set in .done event
              arguments: message.delta || "",
            };
          } else {
            // Continue accumulating arguments
            currentFunctionCallRef.current.arguments += message.delta || "";
          }
        }
        break;

      case "response.function_call_arguments.done":
        // Function call arguments complete, execute the function
        log("[Voice] 📞 response.function_call_arguments.done received");
        log("[Voice] 📞 Message:", message);

        // The .done event contains both name and full arguments
        const callId = message.call_id;
        const functionName = message.name;
        const functionArgs = message.arguments;

        if (callId && functionName && functionArgs) {
          log("[Voice] ✅ Function call complete:", {
            name: functionName,
            callId: callId,
            argumentsLength: functionArgs.length,
          });

          // Handle the function call
          if (functionName === "saveActivity") {
            log("[Voice] ⚡ EXECUTING SAVEACTIVITY ⚡");
            log("[Voice] Arguments:", functionArgs);
            handleFunctionCall(callId, functionName, functionArgs);
          } else {
            logWarn("[Voice] Unknown function:", functionName);
          }

          // Clear the current function call
          currentFunctionCallRef.current = null;
        } else {
          logWarn("[Voice] ❌ Function call done but missing required fields!");
          logWarn("[Voice] call_id:", callId);
          logWarn("[Voice] name:", functionName);
          logWarn("[Voice] arguments:", functionArgs);
          logWarn("[Voice] Full message:", JSON.stringify(message));
        }
        break;

      case "input_audio_buffer.speech_started":
        // Only set listening state if OpenAI is not currently speaking
        if (conversationState !== "speaking") {
          setIsListening(true);
          setConversationState("listening");
          // Immediately update smoothed state to prevent flash
          listeningStartTimeRef.current = Date.now();
          setIsListeningSmoothed(true);
        }
        break;

      case "input_audio_buffer.speech_stopped":
        // Only update state if OpenAI is not currently speaking
        if (conversationState !== "speaking") {
          setIsListening(false);
          setConversationState("processing");
        }
        break;

      case "error":
        logError("[Voice] OpenAI error:", message);
        const errorMessage = message.error?.message || "Unknown error occurred";
        onError?.(new Error(errorMessage));
        break;

      // Silently handle other message types
      case "response.created":
      case "response.done":
      case "response.output_item.added":
      case "response.output_item.done":
      case "response.content_part.added":
      case "response.content_part.done":
      case "response.audio_transcript.delta":
      case "response.audio_transcript.done":
        break;

      default:
        // Only log truly unhandled message types
        break;
    }
  };

  /**
   * Configure the OpenAI session with system instructions and function definition
   */
  const configureSession = () => {
    // Send session.update event to configure the session
    sendMessage({
      type: "session.update",
      session: {
        instructions: OPENAI_SYSTEM_INSTRUCTIONS,
        tools: [SAVE_ACTIVITY_FUNCTION_DEFINITION],
        tool_choice: "auto", // Let OpenAI decide when to call functions
        voice: "ballad",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        turn_detection: {
          type: "server_vad",
          threshold: 0.5, // Voice activity detection sensitivity (0.0-1.0)
          prefix_padding_ms: 300, // Audio before speech starts
          silence_duration_ms: 1000, // Wait 1 second of silence before responding
        },
      },
    });
  };

  /**
   * Handle connect button click
   */
  const handleConnect = async () => {
    try {
      log("[Voice] Connecting to OpenAI...");
      await connect();
    } catch (error) {
      logError("[Voice] Failed to connect:", error);
      onError?.(error as Error);
    }
  };

  /**
   * Request microphone permission on mount and auto-connect when ready
   */
  useEffect(() => {
    if (hasPermission === null) {
      requestPermission();
    } else if (
      hasPermission === true &&
      !isConnected &&
      connectionState !== "connecting"
    ) {
      // Auto-connect when permission is granted
      handleConnect();
    }
  }, [
    hasPermission,
    isConnected,
    connectionState,
    requestPermission,
    connect,
    onError,
  ]);

  /**
   * Smooth out rapid isListening state changes to prevent jarring visual updates
   */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // If OpenAI is speaking, immediately clear smoothed listening state
    if (conversationState === "speaking") {
      setIsListeningSmoothed(false);
      listeningStartTimeRef.current = null;
      return;
    }

    if (isListening) {
      // When listening starts, update immediately and record start time
      // Only update if not already set (to avoid overriding immediate updates from handlers)
      if (!isListeningSmoothed) {
        listeningStartTimeRef.current = Date.now();
        setIsListeningSmoothed(true);
      } else if (!listeningStartTimeRef.current) {
        // If smoothed is true but timestamp is missing, set it
        listeningStartTimeRef.current = Date.now();
      }
    } else {
      // When listening stops, calculate how long we've been listening
      const listeningDuration = listeningStartTimeRef.current
        ? Date.now() - listeningStartTimeRef.current
        : 0;

      // Minimum listening duration is 500ms to prevent jarring transitions
      const minDuration = 500;
      const remainingTime = Math.max(0, minDuration - listeningDuration);

      // Wait for remaining time + 300ms buffer before updating
      timeoutId = setTimeout(() => {
        setIsListeningSmoothed(false);
        listeningStartTimeRef.current = null;
      }, remainingTime + 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isListening, conversationState]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear conversation state
      setConversationState("idle");
      // Clear audio queue
      audioQueueRef.current = [];
      isPlayingRef.current = false;
      // Clear function call
      currentFunctionCallRef.current = null;
      // Stop recording
      stopRecording();
      // Note: We don't disconnect WebSocket here to avoid issues with dev mode remounts
      // The disconnect should be handled by the parent component or manual user action
    };
  }, []);

  /**
   * Get conversation state display information
   */
  const getConversationStateInfo = () => {
    switch (conversationState) {
      case "idle":
        return {
          text: "Ready to listen",
          icon: "🎤",
          color: "text-[#888]",
        };
      case "listening":
        return {
          text: "Listening...",
          icon: "👂",
          color: "text-[#f5c35f]",
        };
      case "processing":
        return {
          text: "Processing...",
          icon: "⚙️",
          color: "text-[#f9dca0]",
        };
      case "speaking":
        return {
          text: "Speaking...",
          icon: "🔊",
          color: "text-[#f5c35f]",
        };
      default:
        return {
          text: "Unknown",
          icon: "❓",
          color: "text-[#888]",
        };
    }
  };

  /**
   * Get connection status text for display
   */
  const getConnectionStatusText = () => {
    if (connectionState === "connected" && !sessionConfigured) {
      return "Configuring...";
    }
    if (connectionState === "connected" && sessionConfigured) {
      return "Ready";
    }

    switch (connectionState) {
      case "disconnected":
        return "Disconnected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      default:
        return "Unknown";
    }
  };

  /**
   * Get connection status color for display
   */
  const getConnectionStatusColor = () => {
    if (connectionState === "connected" && sessionConfigured) {
      return "text-[#f5c35f]";
    }

    switch (connectionState) {
      case "connected":
        return "text-[#f9dca0]"; // Configuring
      case "connecting":
        return "text-[#f9dca0]";
      case "error":
        return "text-red-600";
      default:
        return "text-[#888]";
    }
  };

  /**
   * Check if microphone permission was denied
   */
  const isPermissionDenied = hasPermission === false;

  const conversationStateInfo = getConversationStateInfo();

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          level="success"
          onDismiss={() => setShowToast(false)}
        />
      )}

      {/* Success Confirmation Card */}
      {savedActivity && (
        <div className="w-full max-w-md mb-8 p-6 bg-green-50 border-2 border-green-600 rounded-lg">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">✓</div>
            <h3 className="text-xl font-bold text-green-800 mb-1">
              Activity Logged!
            </h3>
            <p className="text-green-700 font-medium">
              {savedActivity.activityName}
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center py-2 border-b border-green-200">
              <span className="text-sm font-medium text-green-800">
                Total XP Gained:
              </span>
              <span className="text-lg font-bold text-green-900">
                +{savedActivity.totalXpGained} XP
              </span>
            </div>

            {savedActivity.statGains.map((gain) => (
              <div
                key={gain.statType}
                className="flex justify-between items-center py-1"
              >
                <span className="text-sm text-green-700">{gain.statType}:</span>
                <span className="text-sm font-medium text-green-800">
                  +{gain.xpAmount} XP
                </span>
              </div>
            ))}

            {savedActivity.levelUps.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-sm font-bold text-yellow-800 mb-1">
                  🎉 Level Up!
                </p>
                {savedActivity.levelUps.map((levelUp) => (
                  <p key={levelUp.statType} className="text-xs text-yellow-700">
                    {levelUp.statType}: Level {levelUp.oldLevel} → Level{" "}
                    {levelUp.newLevel}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleLogAnother}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Mic size={18} strokeWidth={2} />
              Log Another
            </button>
            <button
              onClick={handleViewFeed}
              className="flex-1 px-4 py-2 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Eye size={18} strokeWidth={2} />
              View Feed
            </button>
          </div>
        </div>
      )}

      {/* Main Interface */}
      <>
        {/* Back/Close Button */}
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={() => navigate({ to: "/" })}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-[#888]" strokeWidth={2} />
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-[#f5c35f]">
            Voice Activity Logging
          </h2>
          <p className="text-[#888] mb-4">
            Speak naturally to log your dog's activities
          </p>

          {/* Permission Denied Message */}
          {isPermissionDenied && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <p className="font-medium mb-1">Microphone Access Required</p>
              <p>
                Please enable microphone permissions in your browser settings to
                use voice logging.
              </p>
            </div>
          )}
        </div>

        {/* Voice Visualizer - RPG-style prominent visualizer */}
        <div className="flex flex-col items-center justify-center my-8">
          {/* Main visualizer with dynamic size */}
          <div
            className={`transition-all duration-500 relative ${
              conversationState === "speaking"
                ? "animate-voice-glow-speaking"
                : isListeningSmoothed
                  ? "animate-voice-glow-active"
                  : "animate-voice-glow"
            }`}
          >
            <CircularWaveform
              size={300}
              numBars={32}
              barWidth={10}
              color1="#f5c35f"
              color2="#f9dca0"
              /*                   color1={
                    conversationState === "speaking"
                      ? "#60a5fa"
                      : isListeningSmoothed
                        ? "#fff1ab"
                        : "#f5c35f"
                  }
                  color2={
                    conversationState === "speaking"
                      ? "#93c5fd"
                      : isListeningSmoothed
                        ? "#fcd587"
                        : "#f9dca0"
                  } */
              backgroundColor="transparent"
              sensitivity={1.5}
              rotationEnabled={true}
              audioTrack={audioTrack}
            />

            {/* Conversation State - Inside the orb (centered) */}
            {isConnected && sessionConfigured && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`text-sm font-medium flex items-center gap-2 ${conversationStateInfo.color}`}
                >
                  {conversationState === "listening" && (
                    <Mic size={16} strokeWidth={2} className="animate-pulse" />
                  )}
                  {conversationState === "speaking" && (
                    <MicOff size={16} strokeWidth={2} />
                  )}
                  <span>{conversationStateInfo.text}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ready Status - Under the orb */}
          {/* {isConnected &&
            sessionConfigured &&
            !isRecording &&
            conversationState === "idle" && (
              <div className="mt-4 text-sm text-[#888] font-medium">
                Ready to listen
              </div>
            )} */}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-[#888] max-w-md">
          <p>
            Just speak naturally to describe your dog's activity. The AI will
            automatically calculate XP rewards and save it.
          </p>
          <p className="mt-2 text-[#f9dca0]">
            Example: "We went on a 20 minute walk this morning"
          </p>
        </div>
      </>
    </div>
  );
}
