// Client-only component for Training Mode
// Uses Web Speech Recognition for wake word detection (free, local)
// Only connects to OpenAI when wake word is detected (cost-effective)

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSelectedCharacter } from "../../hooks/useSelectedCharacter";
import { useWebSpeechRecognition } from "../../hooks/useWebSpeechRecognition";

import { detectWakeWord } from "../../lib/wakeWordDetection";
import { ListeningIndicator } from "./ListeningIndicator";
import { LiveTranscript } from "./LiveTranscript";
import { LastLoggedActivity } from "./LastLoggedActivity";
import { TodaysSummary } from "./TodaysSummary";
import { StopButton } from "./StopButton";
import { useOpenAIRealtime } from "@/hooks/useOpenAIRealtime";
import { RealtimeMessage } from "@/hooks/useOpenAIRealtime";
import { TRAINING_MODE_FUNCTION_DEFINITION } from "@/lib/trainingModeInstructions";
import { TRAINING_MODE_SYSTEM_INSTRUCTIONS } from "@/lib/trainingModeInstructions";

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

export function TrainingModeInterface() {
  const navigate = useNavigate();
  const { selectedCharacterId } = useSelectedCharacter();

  const [lastActivity, setLastActivity] = useState<{
    name: string;
    xpGains: Array<{ statType: string; xpAmount: number }>;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayTranscript, setDisplayTranscript] = useState("");
  const [isProcessingWithOpenAI, setIsProcessingWithOpenAI] = useState(false);

  const firstDog = useQuery(api.queries.getFirstDog);
  const dogId = firstDog?._id;

  const logActivityMutation = useMutation(api.mutations.logActivity);

  const activityPayloadRef = useRef<string>("");
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const currentFunctionCallRef = useRef<{
    callId: string;
    name: string;
    arguments: string;
  } | null>(null);

  // Play audio response from OpenAI
  const playAudioChunk = async (base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      audioQueueRef.current.push(int16Array);
      if (!isPlayingRef.current) {
        playAudioQueue();
      }
    } catch (error) {
      console.error("[Training Mode] Failed to play audio:", error);
    }
  };

  const playAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }
    isPlayingRef.current = true;
    try {
      const audioContext = new AudioContext({ sampleRate: 24000 });
      while (audioQueueRef.current.length > 0) {
        const int16Array = audioQueueRef.current.shift()!;
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] =
            int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
        }
        const audioBuffer = audioContext.createBuffer(
          1,
          float32Array.length,
          24000
        );
        audioBuffer.getChannelData(0).set(float32Array);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        await new Promise<void>((resolve) => {
          source.onended = () => resolve();
          source.start();
        });
      }
      await audioContext.close();
    } catch (error) {
      console.error("[Training Mode] Error playing audio queue:", error);
    } finally {
      isPlayingRef.current = false;
    }
  };

  const handleFunctionCall = async (callId: string, argumentsJson: string) => {
    try {
      const params: SaveActivityParams = JSON.parse(argumentsJson);

      if (
        !params.activityName ||
        !params.statGains ||
        !dogId ||
        !selectedCharacterId
      ) {
        throw new Error("Missing required parameters");
      }

      console.log("[Training Mode] 💾 Logging activity:", params.activityName);

      const result = await logActivityMutation({
        dogId,
        userId: selectedCharacterId,
        activityName: params.activityName,
        description: undefined,
        durationMinutes: params.durationMinutes,
        statGains: params.statGains,
        physicalPoints: params.physicalPoints,
        mentalPoints: params.mentalPoints,
      });

      setLastActivity({
        name: params.activityName,
        xpGains: params.statGains.map((gain) => ({
          statType: gain.statType,
          xpAmount: gain.xpAmount,
        })),
        timestamp: Date.now(),
      });

      if (sendMessageRef.current) {
        sendMessageRef.current({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: callId,
            output: JSON.stringify({
              success: true,
              activityId: result.activityId,
            }),
          },
        });

        sendMessageRef.current({
          type: "response.create",
        });
      }
    } catch (error) {
      console.error("[Training Mode] Function call failed:", error);
      setError("Failed to log activity");

      if (sendMessageRef.current) {
        sendMessageRef.current({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: callId,
            output: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            }),
          },
        });

        sendMessageRef.current({
          type: "response.create",
        });
      }
    }
  };

  // Placeholder for sendMessage - will be set by useOpenAIRealtime
  const sendMessageRef = useRef<((message: any) => void) | null>(null);

  const configureSession = useCallback((activityPayload: string) => {
    if (!sendMessageRef.current) return;

    console.log("[Training Mode] ⚙️ Configuring OpenAI session...");
    sendMessageRef.current({
      type: "session.update",
      session: {
        instructions: TRAINING_MODE_SYSTEM_INSTRUCTIONS,
        tools: [TRAINING_MODE_FUNCTION_DEFINITION],
        tool_choice: "auto",
        voice: "ballad",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000,
        },
      },
    });

    // Send the activity payload as initial user message
    sendMessageRef.current({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: activityPayload,
          },
        ],
      },
    });

    // Trigger response
    sendMessageRef.current({
      type: "response.create",
    });
  }, []);

  const handleRealtimeMessage = useCallback(
    (message: RealtimeMessage) => {
      console.log("[Training Mode] 📨 OpenAI message:", message.type);

      switch (message.type) {
        case "session.created":
          console.log("[Training Mode] 🎯 OpenAI session created");
          configureSession(activityPayloadRef.current);
          break;

        case "session.updated":
          console.log("[Training Mode] ✅ OpenAI session configured and ready");
          setDisplayTranscript("Processing activity...");
          break;

        case "conversation.item.input_audio_transcription.completed":
          if (message.transcript) {
            console.log("[Training Mode] 📝 Transcript:", message.transcript);
            setDisplayTranscript(message.transcript);
          }
          break;

        case "response.audio.delta":
          if (message.delta) {
            console.log("[Training Mode] 🔊 Receiving audio from OpenAI...");
            playAudioChunk(message.delta);
          }
          break;

        case "response.audio.done":
          console.log("[Training Mode] ✅ Audio response complete from OpenAI");
          setTimeout(() => {
            console.log(
              "[Training Mode] 🔌 Disconnecting from OpenAI (activity complete)"
            );
            disconnect();
            setIsProcessingWithOpenAI(false);
            setDisplayTranscript("");
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            currentFunctionCallRef.current = null;
            activityPayloadRef.current = "";
            console.log("[Training Mode] 👂 Ready for next wake word...");
          }, 500);
          break;

        case "response.function_call_arguments.delta":
          if (message.call_id) {
            if (
              !currentFunctionCallRef.current ||
              currentFunctionCallRef.current.callId !== message.call_id
            ) {
              currentFunctionCallRef.current = {
                callId: message.call_id,
                name: "",
                arguments: message.delta || "",
              };
            } else {
              currentFunctionCallRef.current.arguments += message.delta || "";
            }
          }
          break;

        case "response.function_call_arguments.done":
          const callId = message.call_id;
          const functionName = message.name;
          const functionArgs = message.arguments;

          if (callId && functionName && functionArgs) {
            if (functionName === "saveActivity") {
              handleFunctionCall(callId, functionArgs);
            }
          }

          currentFunctionCallRef.current = null;
          break;

        case "error":
          console.error("[Training Mode] ❌ OpenAI error:", message);
          setError(message.error?.message || "Unknown error");
          setIsProcessingWithOpenAI(false);
          disconnect();
          break;
      }
    },
    [configureSession]
  );

  const {
    connect: connectOpenAI,
    disconnect,
    sendMessage,
  } = useOpenAIRealtime({
    onMessage: handleRealtimeMessage,
    onError: (err) => {
      console.error("[Training Mode] ❌ OpenAI error:", err);
      setError(err.message);
      setIsProcessingWithOpenAI(false);
    },
  });

  // Store sendMessage in ref for use in callbacks
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Web Speech Recognition for wake word detection (auto-starts)
  const {
    transcript: speechTranscript,
    isListening: isSpeechListening,
    error: speechError,
    stopListening: stopSpeech,
    resetTranscript,
  } = useWebSpeechRecognition();

  // Monitor transcript for wake word
  useEffect(() => {
    if (!speechTranscript) {
      return;
    }

    // DEBUG: Show what we're hearing
    console.log("[Training Mode] 🎤 Transcript:", speechTranscript);

    // Skip if already processing
    if (isProcessingWithOpenAI) {
      return;
    }

    const result = detectWakeWord(speechTranscript);
    console.log("[Training Mode] 🔍 Wake word check:", result);

    if (result.detected) {
      console.log("[Training Mode] 🎯 Wake word detected:", result.wakeWord);
      console.log("[Training Mode] 📝 Activity payload:", result.payload);

      // Check if payload is empty
      if (!result.payload || result.payload.trim() === "") {
        console.warn(
          "[Training Mode] ⚠️ Empty payload - need activity description after wake word"
        );
        setError(
          "Please say the activity after 'Jarvis' (e.g., 'Jarvis walked for 10 minutes')"
        );
        return;
      }

      // Store payload for OpenAI session
      activityPayloadRef.current = result.payload;

      // Update UI
      setDisplayTranscript(
        `Wake word detected! Processing: "${result.payload}"`
      );
      setIsProcessingWithOpenAI(true);
      setError(null);

      // Reset transcript for next detection (but keep listening!)
      resetTranscript();

      // Connect to OpenAI
      console.log("[Training Mode] 🔌 Attempting to connect to OpenAI...");
      console.log(
        "[Training Mode] connectOpenAI function:",
        typeof connectOpenAI
      );

      try {
        const connectPromise = connectOpenAI();
        console.log("[Training Mode] connectOpenAI returned:", connectPromise);

        connectPromise
          .then(() => {
            console.log("[Training Mode] ✅ Connected to OpenAI!");
          })
          .catch((err) => {
            console.error("[Training Mode] ❌ Failed to connect (catch):", err);
            setError(`Failed to connect to voice service: ${err.message}`);
            setIsProcessingWithOpenAI(false);
            activityPayloadRef.current = "";
          });
      } catch (err) {
        console.error("[Training Mode] ❌ Failed to connect (try-catch):", err);
        setError(`Failed to connect to voice service: ${err}`);
        setIsProcessingWithOpenAI(false);
        activityPayloadRef.current = "";
      }
    }
  }, [
    speechTranscript,
    isProcessingWithOpenAI,
    connectOpenAI,
    resetTranscript,
  ]);

  const handleStop = () => {
    console.log("[Training Mode] 🛑 Stop button clicked");
    stopSpeech();
    disconnect();
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    currentFunctionCallRef.current = null;
    activityPayloadRef.current = "";
    navigate({ to: "/" });
  };

  // Cleanup on unmount
  useEffect(() => {
    console.log("[Training Mode] 🎤 Training Mode mounted");

    return () => {
      console.log("[Training Mode] 🛑 Cleaning up...");
      stopSpeech();
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount/unmount

  return (
    <div className="min-h-screen bg-[#121216] text-white pb-24">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-[#f5c35f]">Training Mode</h1>
        <p className="text-sm text-[#f9dca0] mt-1">
          Say "Jarvis" to start logging an activity
        </p>
      </div>

      <ListeningIndicator isListening={isSpeechListening} />

      {/* DEBUG: Show raw transcript */}
      <div className="px-6 py-4">
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <p className="text-blue-400 text-sm font-medium mb-1">
            Raw Transcript (DEBUG)
          </p>
          <p className="text-blue-300 text-sm break-words">
            {speechTranscript || "(waiting for speech...)"}
          </p>
          <button
            onClick={() => {
              console.log("[Training Mode] Manual reset transcript");
              resetTranscript();
            }}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded"
          >
            Clear Transcript
          </button>
        </div>
      </div>

      <LiveTranscript transcript={displayTranscript} />
      {lastActivity && <LastLoggedActivity activity={lastActivity} />}
      {dogId && <TodaysSummary dogId={dogId} />}

      {error && (
        <div className="px-6 py-4">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm font-medium mb-1">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {speechError && (
        <div className="px-6 py-4">
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-400 text-sm font-medium mb-1">
              Microphone Issue
            </p>
            <p className="text-yellow-300 text-sm">{speechError}</p>
          </div>
        </div>
      )}

      {isProcessingWithOpenAI && (
        <div className="px-6 py-4">
          <div className="bg-[#1a1a1e] rounded-lg p-4 text-center border border-[#f5c35f]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5c35f] mb-2"></div>
            <p className="text-[#f9dca0] text-sm font-medium">
              🔌 Connecting to OpenAI...
            </p>
            <p className="text-[#f9dca0] text-xs mt-2 opacity-75">
              Activity: {displayTranscript}
            </p>
          </div>
        </div>
      )}

      <StopButton onClick={handleStop} />
    </div>
  );
}
