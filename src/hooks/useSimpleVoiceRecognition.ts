import { useState, useEffect, useRef, useCallback } from "react";

interface UseSimpleVoiceRecognitionReturn {
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

/**
 * Simple voice recognition hook for discrete recording sessions
 * (like dog onboarding). Does NOT auto-start or auto-restart.
 *
 * For continuous listening (training mode), use useWebSpeechRecognition instead.
 */
export function useSimpleVoiceRecognition(): UseSimpleVoiceRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize Speech Recognition (but don't start it)
  useEffect(() => {
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
    recognition.continuous = false; // Single session, no auto-restart
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let fullTranscript = "";

      // Build complete transcript from all results
      for (let i = 0; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        fullTranscript += transcriptPiece + " ";
      }

      // Update transcript
      setTranscript(fullTranscript.trim());
    };

    // Handle recognition end
    recognition.onend = () => {
      setIsListening(false);
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[Voice Recognition] Error:", event.error);

      switch (event.error) {
        case "not-allowed":
        case "permission-denied":
          setError(
            "Microphone access denied. Please grant permission in your browser settings."
          );
          break;

        case "no-speech":
          setError("No speech detected. Please try again and speak clearly.");
          break;

        case "audio-capture":
          setError("No microphone detected. Please connect a microphone.");
          break;

        case "network":
          setError("Network error. Please check your connection.");
          break;

        case "aborted":
          // Normal when stopping, don't show error
          break;

        default:
          setError(`Voice recognition error: ${event.error}`);
          break;
      }

      setIsListening(false);
    };

    // Handle start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition not initialized");
      return;
    }

    if (isListening) {
      return; // Already listening
    }

    try {
      recognitionRef.current.start();
      setError(null);
    } catch (err) {
      console.error("[Voice Recognition] Start error:", err);
      if (err instanceof Error && !err.message.includes("already started")) {
        setError("Failed to start voice recognition");
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error("[Voice Recognition] Stop error:", err);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
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
