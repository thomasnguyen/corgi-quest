import { useState, useEffect, useRef, useCallback } from "react";

interface UseWebSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// TypeScript definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Extend Window interface for webkit prefix
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

export function useWebSpeechRecognition(): UseWebSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestartingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    // Prevent double initialization
    if (isInitializedRef.current) {
      console.log("[Speech Recognition] Already initialized, skipping");
      return;
    }

    console.log("[Speech Recognition] Initializing...");
    isInitializedRef.current = true;

    // Check browser compatibility
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError(
        "Your browser doesn't support voice recognition. Please use Chrome or Safari."
      );
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log("[Speech Recognition] 🎤 Got result event");
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        console.log(
          "[Speech Recognition] Transcript piece:",
          transcriptPiece,
          "isFinal:",
          event.results[i].isFinal
        );
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + " ";
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      // Accumulate transcript
      setTranscript((prev) => {
        const newTranscript = prev + finalTranscript + interimTranscript;
        console.log("[Speech Recognition] 📝 New transcript:", newTranscript);
        return newTranscript;
      });
    };

    // Handle recognition end - auto-restart if needed
    recognition.onend = () => {
      // Don't restart if we're already restarting or shouldn't be listening
      if (isRestartingRef.current || !shouldRestartRef.current) {
        if (!shouldRestartRef.current) {
          setIsListening(false);
        }
        return;
      }

      isRestartingRef.current = true;
      // Keep isListening true during restart to prevent UI flicker

      // Clear any existing restart timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }

      // Restart after a short delay to prevent rapid restart loops
      restartTimeoutRef.current = setTimeout(() => {
        if (!shouldRestartRef.current) {
          isRestartingRef.current = false;
          setIsListening(false);
          return;
        }

        try {
          recognition.start();
          // isListening stays true throughout
          setError(null);
        } catch (err) {
          // Silently fail - will try again on next end event
        } finally {
          isRestartingRef.current = false;
        }
      }, 100); // Shorter delay for faster restart
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error(
        "[Speech Recognition] ❌ Error:",
        event.error,
        event.message
      );
      switch (event.error) {
        case "not-allowed":
        case "permission-denied":
          console.error("[Speech Recognition] Microphone permission denied!");
          setError(
            "Microphone access required for Training Mode. Please grant permission in your browser settings."
          );
          shouldRestartRef.current = false;
          setIsListening(false);
          break;

        case "no-speech":
          console.log("[Speech Recognition] No speech detected (normal)");
          // This is normal - just continue listening
          break;

        case "audio-capture":
          console.error("[Speech Recognition] No microphone detected!");
          setError("No microphone detected. Please connect a microphone.");
          shouldRestartRef.current = false;
          setIsListening(false);
          break;

        case "network":
          console.warn("[Speech Recognition] Network error (will continue)");
          // Network errors shouldn't stop continuous listening
          break;

        case "aborted":
          console.log(
            "[Speech Recognition] Recognition aborted (normal when stopping)"
          );
          // Recognition was aborted - this is normal when stopping
          break;

        default:
          console.warn(
            "[Speech Recognition] Other error (will auto-restart):",
            event.error
          );
          // For other errors, don't show to user - will auto-restart
          break;
      }
    };

    // Handle start
    recognition.onstart = () => {
      console.log("[Speech Recognition] 🎙️ Recognition started!");
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current = recognition;

    // Auto-start recognition
    console.log("[Speech Recognition] Auto-starting recognition...");
    shouldRestartRef.current = true;
    try {
      recognition.start();
      // Set listening to true immediately since we're starting
      setIsListening(true);
    } catch (err) {
      console.error("[Speech Recognition] Auto-start failed:", err);
    }

    return () => {
      console.log("[Speech Recognition] Cleanup called");
      // Clear restart timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }

      if (recognitionRef.current) {
        shouldRestartRef.current = false;
        isRestartingRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    console.log("[Speech Recognition] startListening called");

    if (!recognitionRef.current) {
      console.error("[Speech Recognition] Recognition not initialized!");
      setError("Speech recognition not initialized");
      return;
    }

    // Don't try to start if already listening or restarting
    if (isListening || isRestartingRef.current) {
      console.log(
        "[Speech Recognition] Already listening or restarting, skipping"
      );
      return;
    }

    shouldRestartRef.current = true;

    try {
      console.log("[Speech Recognition] Calling recognition.start()...");
      recognitionRef.current.start();
      setError(null);
      console.log("[Speech Recognition] ✅ Started successfully");
    } catch (err) {
      console.error("[Speech Recognition] Start error:", err);
      // If already started, this will throw - that's okay
      if (err instanceof Error && err.message.includes("already started")) {
        console.log(
          "[Speech Recognition] Already started, setting listening to true"
        );
        setIsListening(true);
      } else {
        console.error("[Speech Recognition] Unexpected error:", err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    shouldRestartRef.current = false;
    isRestartingRef.current = false;

    // Clear any pending restart
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error("[Speech Recognition] Stop failed:", err);
    }

    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
