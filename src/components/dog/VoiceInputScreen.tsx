import { useState, useEffect, useRef } from "react";
import { Mic, AlertCircle, RotateCcw } from "lucide-react";
import { useWebSpeechRecognition } from "../../hooks/useWebSpeechRecognition";
import { ListeningIndicator } from "../training/ListeningIndicator";

interface VoiceInputScreenProps {
  onTranscriptComplete: (transcript: string) => void;
  onError: (error: string) => void;
}

/**
 * VoiceInputScreen component for voice-powered dog onboarding
 *
 * Displays title, subtitle, example text, and large microphone button.
 * Uses Web Speech API to capture and transcribe user's dog description.
 * Auto-stops listening after 10 seconds or on silence detection.
 *
 * Enhanced error handling for:
 * - Microphone permission issues
 * - No speech detected timeout
 * - Browser compatibility
 *
 * Requirements: 4.2, 4.3, 4.4, 4.5, 5.5, 10.5
 */
export function VoiceInputScreen({
  onTranscriptComplete,
  onError,
}: VoiceInputScreenProps) {
  const [isActive, setIsActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [noSpeechDetected, setNoSpeechDetected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const noSpeechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef("");
  const [debouncedTranscript, setDebouncedTranscript] = useState("");
  const transcriptDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Use Web Speech API hook - Requirements: 4.5
  const {
    transcript,
    isListening,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useWebSpeechRecognition();

  // Handle microphone button tap - Requirements: 4.4
  const handleMicrophoneTap = () => {
    if (isActive) {
      // Stop listening if already active
      handleStopListening();
    } else {
      // Clear any previous errors
      setLocalError(null);
      setNoSpeechDetected(false);

      // Start listening
      setIsActive(true);
      resetTranscript();
      lastTranscriptRef.current = "";
      startListening();

      // Set 10-second timeout - Requirements: 4.5, 5.5
      timeoutRef.current = setTimeout(() => {
        handleStopListening();
      }, 10000);

      // Set no-speech detection timeout (5 seconds) - Requirements: 5.5
      noSpeechTimeoutRef.current = setTimeout(() => {
        if (!transcript.trim()) {
          setNoSpeechDetected(true);
          handleStopListening();
          setLocalError(
            "No speech detected. Please tap the microphone and speak clearly."
          );
        }
      }, 5000);
    }
  };

  // Handle stopping listening
  const handleStopListening = () => {
    stopListening();
    setIsActive(false);

    // Clear timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (noSpeechTimeoutRef.current) {
      clearTimeout(noSpeechTimeoutRef.current);
      noSpeechTimeoutRef.current = null;
    }

    // Call completion callback with final transcript if we have one
    if (transcript.trim() && !noSpeechDetected) {
      onTranscriptComplete(transcript.trim());
    }
  };

  // Handle retry after error - Requirements: 5.5
  const handleRetry = () => {
    setLocalError(null);
    setNoSpeechDetected(false);
    resetTranscript();
    lastTranscriptRef.current = "";
  };

  // Handle speech recognition errors - Requirements: 4.4, 4.5, 5.5
  useEffect(() => {
    if (speechError) {
      // Set local error for display
      setLocalError(speechError);
      setIsActive(false);

      // Clear timeouts on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (noSpeechTimeoutRef.current) {
        clearTimeout(noSpeechTimeoutRef.current);
        noSpeechTimeoutRef.current = null;
      }

      // Also propagate to parent for modal-level error handling
      onError(speechError);
    }
  }, [speechError, onError]);

  // Clear no-speech timeout when transcript updates - Requirements: 5.5
  useEffect(() => {
    if (transcript.trim() && noSpeechTimeoutRef.current) {
      clearTimeout(noSpeechTimeoutRef.current);
      noSpeechTimeoutRef.current = null;
      setNoSpeechDetected(false);
    }
  }, [transcript]);

  // Debounce transcript updates to prevent animation jank - Requirements: 10.3
  useEffect(() => {
    if (!isActive) {
      setDebouncedTranscript("");
      return;
    }

    // Clear previous debounce timeout
    if (transcriptDebounceRef.current) {
      clearTimeout(transcriptDebounceRef.current);
    }

    // Set new debounce timeout (150ms)
    transcriptDebounceRef.current = setTimeout(() => {
      setDebouncedTranscript(transcript);
    }, 150);

    return () => {
      if (transcriptDebounceRef.current) {
        clearTimeout(transcriptDebounceRef.current);
      }
    };
  }, [transcript, isActive]);

  // Detect silence (no new transcript for 3 seconds) - Requirements: 4.5
  useEffect(() => {
    if (!isActive || !isListening) {
      return;
    }

    // Check if transcript has changed
    if (transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
    }
  }, [transcript, isActive, isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (noSpeechTimeoutRef.current) {
        clearTimeout(noSpeechTimeoutRef.current);
      }
      if (transcriptDebounceRef.current) {
        clearTimeout(transcriptDebounceRef.current);
      }
      stopListening();
    };
  }, [stopListening]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6">
      {/* Title - Requirements: 4.2, 10.4 */}
      <h2 className="text-xl sm:text-2xl font-bold text-[#f9dca0] mb-2 text-center">
        Add a new dog
      </h2>

      {/* Subtitle - Requirements: 4.2, 10.4 */}
      <p className="text-gray-400 text-sm mb-6 sm:mb-8 text-center">
        Describe your dog in one sentence
      </p>

      {/* Error display - Requirements: 5.5, 10.4 */}
      {localError && !isActive && (
        <div className="mb-6 px-3 sm:px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg max-w-md w-full">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-red-400 text-xs sm:text-sm break-words">
                {localError}
              </p>
              {localError.includes("permission") && (
                <p className="text-red-300/70 text-xs mt-2">
                  To enable microphone access:
                  <br />
                  1. Click the lock icon in your browser's address bar
                  <br />
                  2. Allow microphone access for this site
                  <br />
                  3. Refresh the page and try again
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Show listening indicator when active - Requirements: 4.4 */}
      {isActive ? (
        <div className="mb-8">
          <ListeningIndicator isListening={isListening} />
          {debouncedTranscript && (
            <div className="mt-4 px-3 sm:px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-700 max-w-md w-full">
              <p className="text-gray-300 text-sm break-words">
                {debouncedTranscript}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Microphone button - Requirements: 4.3, 10.5 */}
          <button
            onClick={handleMicrophoneTap}
            disabled={!!localError}
            className="w-[80px] h-[80px] min-w-[60px] min-h-[60px] rounded-full bg-[#f5c35f] hover:bg-[#f9dca0] disabled:bg-gray-700 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center shadow-lg mb-8"
            aria-label="Start voice recording"
          >
            <Mic className="w-10 h-10 text-[#121216]" />
          </button>

          {/* Example text - Requirements: 4.3, 10.4 */}
          <div className="text-center max-w-md w-full px-4">
            <p className="text-gray-500 text-xs mb-2">Example:</p>
            <p className="text-gray-400 text-sm italic break-words">
              "Luna, golden retriever, friendly but distractible"
            </p>
          </div>
        </>
      )}

      {/* Action buttons */}
      {isActive && (
        <button
          onClick={handleStopListening}
          className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm font-medium transition-colors"
        >
          Done
        </button>
      )}

      {/* Retry button after error - Requirements: 5.5 */}
      {localError && !isActive && (
        <button
          onClick={handleRetry}
          className="mt-4 px-6 py-2 bg-[#f5c35f] hover:bg-[#f9dca0] rounded-lg text-[#121216] font-medium text-sm transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}
