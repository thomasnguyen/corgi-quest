/**
 * Wake Word Detection Utility for Training Mode
 *
 * Detects variations of "Corgi Quest" wake word in transcript
 * and extracts the activity payload that follows.
 */

export interface WakeWordResult {
  detected: boolean;
  payload: string;
  wakeWord: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Supported wake word variations (case-insensitive)
 * Using "Jarvis" as the wake word
 * Including common misheard variations
 */
const WAKE_WORDS = [
  "jarvis",
  "jarvis,",
  "jarvis.",
  "jarvas",
  "jarves",
  "jarvus",
  "jarvis'",
  "jar vis",
  "jar viss",
] as const;

/**
 * Detects wake word in transcript and extracts activity payload
 *
 * @param transcript - The speech recognition transcript to analyze
 * @returns WakeWordResult with detection status and extracted payload
 *
 * @example
 * detectWakeWord("jarvis stayed calm when bike passed")
 * // Returns: { detected: true, payload: "stayed calm when bike passed", ... }
 *
 * @example
 * detectWakeWord("just walking my dog")
 * // Returns: { detected: false, payload: "", ... }
 */
export function detectWakeWord(transcript: string): WakeWordResult {
  const lower = transcript.toLowerCase();

  // Try each wake word variation
  for (const wakeWord of WAKE_WORDS) {
    const index = lower.indexOf(wakeWord);

    if (index !== -1) {
      // Calculate end index of wake word
      const endIndex = index + wakeWord.length;

      // Extract everything after the wake word
      const rawPayload = transcript.substring(endIndex);

      // Clean up payload: remove leading punctuation and whitespace
      const payload = rawPayload
        .trim()
        .replace(/^[,:;.\s]+/, "") // Remove leading punctuation
        .trim();

      return {
        detected: true,
        payload,
        wakeWord,
        startIndex: index,
        endIndex,
      };
    }
  }

  // No wake word detected
  return {
    detected: false,
    payload: "",
    wakeWord: "",
    startIndex: -1,
    endIndex: -1,
  };
}
