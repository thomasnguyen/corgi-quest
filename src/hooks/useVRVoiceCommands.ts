import { useState, useEffect, useCallback } from "react";
import { useWebSpeechRecognition } from "./useWebSpeechRecognition";

export interface VoiceCommand {
  type: "start_session" | "mark_rep" | "end_session" | "unknown";
  payload?: string;
}

interface UseVRVoiceCommandsReturn {
  command: VoiceCommand | null;
  clearCommand: () => void;
  isListening: boolean;
  transcript: string;
  error: string | null;
  micPermissionGranted: boolean;
}

/**
 * Custom hook for VR voice command recognition
 * Integrates Web Speech API for hands-free training in VR
 */
export function useVRVoiceCommands(): UseVRVoiceCommandsReturn {
  const [command, setCommand] = useState<VoiceCommand | null>(null);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  const { transcript, isListening, error, startListening } =
    useWebSpeechRecognition();

  // Request microphone permissions on mount
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // Permission granted, stop the stream
        stream.getTracks().forEach((track) => track.stop());
        setMicPermissionGranted(true);

        // Start listening after permission granted
        startListening();
      } catch (err) {
        console.error("Microphone permission denied:", err);
        setMicPermissionGranted(false);
      }
    };

    requestMicPermission();
  }, [startListening]);

  // Parse voice commands from transcript
  useEffect(() => {
    if (!transcript) return;

    const lowerTranscript = transcript.toLowerCase();

    // Parse commands with activity type detection
    if (
      lowerTranscript.includes("start session") ||
      lowerTranscript.includes("begin training") ||
      lowerTranscript.includes("start training")
    ) {
      setCommand({ type: "start_session" });
    } else if (
      lowerTranscript.includes("mark rep") ||
      lowerTranscript.includes("mark repetition") ||
      lowerTranscript.includes("rep done") ||
      lowerTranscript.includes("mark")
    ) {
      setCommand({ type: "mark_rep" });
    } else if (lowerTranscript.includes("end session")) {
      // Extract description after "end session"
      const endIndex = lowerTranscript.indexOf("end session");
      const description = transcript
        .substring(endIndex + "end session".length)
        .trim();

      // Parse activity details from description
      const parsedActivity = parseActivityDescription(description);

      setCommand({
        type: "end_session",
        payload: parsedActivity.fullDescription,
      });
    }
  }, [transcript]);

  /**
   * Parse natural language activity description
   * Extracts activity type, duration, and context
   */
  const parseActivityDescription = (description: string) => {
    const lowerDesc = description.toLowerCase();

    // Detect activity types
    const activityTypes = {
      sit: ["sit", "sitting"],
      stay: ["stay", "staying", "waited"],
      walk: ["walk", "walked", "walking"],
      fetch: ["fetch", "fetching", "retrieved"],
      calm: ["calm", "calmly", "relaxed"],
      heel: ["heel", "heeling"],
      come: ["come", "came", "recall"],
      down: ["down", "lay down", "lying"],
      leave: ["leave it", "left it", "ignored"],
    };

    let detectedActivity = "training";
    for (const [activity, keywords] of Object.entries(activityTypes)) {
      if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
        detectedActivity = activity;
        break;
      }
    }

    // Extract duration (e.g., "10 minutes", "5 min")
    const durationMatch = lowerDesc.match(/(\d+)\s*(minute|min|minutes)/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : null;

    // Extract context (e.g., "around 2 dogs", "with distractions")
    const contextKeywords = [
      "around",
      "with",
      "near",
      "during",
      "while",
      "despite",
    ];
    let context = "";
    for (const keyword of contextKeywords) {
      if (lowerDesc.includes(keyword)) {
        const contextIndex = lowerDesc.indexOf(keyword);
        context = description.substring(contextIndex);
        break;
      }
    }

    return {
      activityType: detectedActivity,
      duration,
      context,
      fullDescription: description || `${detectedActivity} training`,
    };
  };

  const clearCommand = useCallback(() => {
    setCommand(null);
  }, []);

  return {
    command,
    clearCommand,
    isListening,
    transcript,
    error,
    micPermissionGranted,
  };
}
