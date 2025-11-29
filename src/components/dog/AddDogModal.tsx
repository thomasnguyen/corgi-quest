import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { VoiceInputScreen } from "./VoiceInputScreen";
import { ConfirmationScreen, ParsedDogData } from "./ConfirmationScreen";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSelectedCharacter } from "../../hooks/useSelectedCharacter";
import type { Id } from "../../../convex/_generated/dataModel";

// Modal state machine types - Requirements: 4.1, 5.5
type ModalState =
  | { stage: "voice-input" }
  | { stage: "listening" }
  | { stage: "processing"; transcript: string }
  | { stage: "confirmation"; parsedData: ParsedDogData }
  | { stage: "creating" }
  | { stage: "error"; message: string; preservedTranscript?: string };

interface QuestInfo {
  questId: Id<"quests">;
  questName: string;
  targetReps: number;
}

interface AddDogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    dogId: Id<"dogs">,
    dogName: string,
    questInfo?: QuestInfo
  ) => void;
}

/**
 * AddDogModal orchestrator component
 *
 * Manages the complete AI-powered dog onboarding flow:
 * 1. Voice input stage - capture dog description
 * 2. Processing stage - AI parsing with "Thinking..." indicator
 * 3. Confirmation stage - review and edit parsed data
 * 4. Creation stage - create dog profile with stats and quest
 *
 * Uses state machine pattern for clear state transitions and error handling.
 *
 * Requirements: 4.1, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.4, 6.5, 7.1, 7.2, 10.1, 10.2
 */
export function AddDogModal({ isOpen, onClose, onSuccess }: AddDogModalProps) {
  const { selectedUser } = useSelectedCharacter();
  const [modalState, setModalState] = useState<ModalState>({
    stage: "voice-input",
  });

  // Convex actions and mutations
  const parseDogDescription = useAction(api.actions.parseDogDescription);
  const createDogWithStats = useMutation(api.mutations.createDogWithStats);

  // Reset state when modal opens/closes - Requirements: 4.1, 10.2
  useEffect(() => {
    if (isOpen) {
      setModalState({ stage: "voice-input" });
    }
  }, [isOpen]);

  // Handle modal close with animation - Requirements: 4.1, 10.2
  const handleClose = () => {
    onClose();
  };

  // Handle transcript completion from voice input - Requirements: 5.1
  const handleTranscriptComplete = async (transcript: string) => {
    // Transition to processing state - Requirements: 5.1
    setModalState({ stage: "processing", transcript });

    try {
      // Call AI parsing action with timeout - Requirements: 5.2, 5.3, 5.4, 10.1
      const parsed = await parseDogDescription({ transcript });

      // Validate parsed data has required fields - Requirements: 5.5
      if (!parsed.name || !parsed.breed || !parsed.traits) {
        throw new Error(
          "Could not extract all required information. Please provide more details about your dog's name, breed, and personality."
        );
      }

      // Transition to confirmation state on success - Requirements: 5.2
      setModalState({
        stage: "confirmation",
        parsedData: parsed as ParsedDogData,
      });
    } catch (error) {
      // Handle parsing errors - Requirements: 5.5
      let errorMessage =
        "Failed to parse dog description. Please try again with more details.";

      if (error instanceof Error) {
        // Provide user-friendly error messages
        if (error.message.includes("Could not extract")) {
          errorMessage = error.message;
        } else if (error.message.includes("Rate limit")) {
          errorMessage =
            "Too many requests. Please wait a moment and try again.";
        } else if (error.message.includes("authentication")) {
          errorMessage =
            "Service temporarily unavailable. Please try again later.";
        } else if (error.message.includes("Network error")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.message.includes("timed out")) {
          errorMessage =
            "Request timed out. Please try again with a simpler description.";
        } else if (error.message.includes("temporarily unavailable")) {
          errorMessage = error.message;
        } else {
          // Use generic message for unknown errors
          errorMessage = `Unable to process description: ${error.message}`;
        }
      }

      // Preserve transcript for retry - Requirements: 5.5
      setModalState({
        stage: "error",
        message: errorMessage,
        preservedTranscript: transcript,
      });
    }
  };

  // Handle voice input error - Requirements: 5.5
  const handleVoiceError = (error: string) => {
    setModalState({
      stage: "error",
      message: error,
      preservedTranscript: undefined, // No transcript to preserve for voice errors
    });
  };

  // Handle retry from error or confirmation screen - Requirements: 5.5, 6.5
  const handleRetry = () => {
    setModalState({ stage: "voice-input" });
  };

  // Handle retry with preserved transcript - Requirements: 5.5
  const handleRetryWithTranscript = async () => {
    if (
      modalState.stage === "error" &&
      modalState.preservedTranscript &&
      modalState.preservedTranscript.trim()
    ) {
      // Retry parsing with the preserved transcript
      await handleTranscriptComplete(modalState.preservedTranscript);
    } else {
      // Fall back to voice input if no transcript
      handleRetry();
    }
  };

  // Handle confirmation and dog creation - Requirements: 6.4, 7.1, 7.2
  const handleConfirm = async (editedName?: string) => {
    if (modalState.stage !== "confirmation") return;
    if (!selectedUser?.householdId) {
      setModalState({
        stage: "error",
        message:
          "Unable to create dog profile. Please refresh the page and try again.",
      });
      return;
    }

    // Store confirmation data for potential retry - Requirements: 6.4
    const confirmationData = {
      name: editedName || modalState.parsedData.name,
      breed: modalState.parsedData.breed,
      traits: modalState.parsedData.traits,
      initialStatEmphasis: modalState.parsedData.initialStatEmphasis,
      starterQuest: modalState.parsedData.starterQuest,
    };

    // Transition to creating state
    setModalState({ stage: "creating" });

    try {
      // Call createDogWithStats mutation - Requirements: 7.1
      const result = await createDogWithStats({
        householdId: selectedUser.householdId,
        name: confirmationData.name,
        breed: confirmationData.breed,
        traits: confirmationData.traits,
        initialStatEmphasis: confirmationData.initialStatEmphasis,
        starterQuest: confirmationData.starterQuest,
      });

      if (result.success && result.dogId) {
        // Prepare quest info if available - Requirements: 8.1
        const questInfo: QuestInfo | undefined = result.questId
          ? {
              questId: result.questId,
              questName: confirmationData.starterQuest.name,
              targetReps: confirmationData.starterQuest.reps,
            }
          : undefined;

        // Call onSuccess callback with new dog ID, name, and quest info - Requirements: 7.2, 7.3, 8.1
        onSuccess(result.dogId, confirmationData.name, questInfo);
        // Close modal on success - Requirements: 7.2
        handleClose();
      } else {
        throw new Error("Failed to create dog profile. Please try again.");
      }
    } catch (error) {
      // Handle creation errors - Requirements: 6.4
      let errorMessage =
        "Failed to create dog profile. Please try again later.";

      if (error instanceof Error) {
        // Log error for debugging - Requirements: 6.4
        console.error("Dog creation error:", error);

        // Provide user-friendly error messages
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "Request timed out. Please check your connection and try again.";
        } else if (error.message.includes("validation")) {
          errorMessage =
            "Invalid dog information. Please go back and check the details.";
        } else if (error.message.includes("duplicate")) {
          errorMessage =
            "A dog with this name already exists. Please use a different name.";
        } else {
          // Use error message if it's user-friendly
          errorMessage = error.message;
        }
      }

      // Return to confirmation screen with error - Requirements: 6.4
      setModalState({
        stage: "confirmation",
        parsedData: {
          name: confirmationData.name,
          breed: confirmationData.breed,
          traits: confirmationData.traits,
          initialStatEmphasis: confirmationData.initialStatEmphasis,
          starterQuest: confirmationData.starterQuest,
        },
      });

      // Show error toast or alert
      alert(errorMessage);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Requirements: 4.1, 10.2 */}
      <div
        className="fixed inset-0 bg-black/80 z-40 transition-opacity duration-300"
        style={{ willChange: "opacity" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal - Requirements: 4.1, 10.2, 10.3, 10.4 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div
          className="border border-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
          style={{
            background:
              "linear-gradient(180deg, rgba(18, 18, 22, 0.98) 0%, rgba(26, 26, 30, 0.98) 50%, rgba(139, 92, 46, 0.12) 100%)",
            willChange: "transform, opacity",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button - Requirements: 10.4 */}
          <div
            className="sticky top-0 border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(18, 18, 22, 0.98) 0%, rgba(18, 18, 22, 0.95) 100%)",
            }}
          >
            <h2 className="text-lg sm:text-xl font-bold text-[#f9dca0]">
              {modalState.stage === "voice-input" ||
              modalState.stage === "listening"
                ? "Add a new dog"
                : modalState.stage === "processing"
                  ? "Processing..."
                  : modalState.stage === "confirmation"
                    ? "Confirm details"
                    : modalState.stage === "creating"
                      ? "Creating profile..."
                      : "Error"}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Modal content based on state - Requirements: 10.4 */}
          <div className="p-4 sm:p-6">
            {/* Voice input stage - Requirements: 5.1 */}
            {(modalState.stage === "voice-input" ||
              modalState.stage === "listening") && (
              <VoiceInputScreen
                onTranscriptComplete={handleTranscriptComplete}
                onError={handleVoiceError}
              />
            )}

            {/* Processing stage - Requirements: 5.1 */}
            {modalState.stage === "processing" && (
              <div className="flex flex-col min-h-[50vh] px-4 sm:px-6 py-6">
                {/* Header with pulsing icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#f5c35f]/20 flex items-center justify-center animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-[#f5c35f]" />
                  </div>
                  <div>
                    <p className="text-[#f9dca0] font-semibold text-base">
                      Analyzing your dog...
                    </p>
                    <p className="text-gray-500 text-xs">
                      Extracting details from description
                    </p>
                  </div>
                </div>

                {/* Show the transcript being analyzed */}
                <div className="mb-6 px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <p className="text-gray-500 text-xs mb-1">
                    Your description:
                  </p>
                  <p className="text-gray-300 text-sm">
                    {modalState.transcript}
                  </p>
                </div>

                {/* Skeleton loaders for fields being extracted */}
                <div className="space-y-4">
                  {/* Name skeleton */}
                  <div className="animate-pulse-slow">
                    <p className="text-gray-500 text-xs mb-2">
                      Extracting name...
                    </p>
                    <div className="h-10 bg-gray-800/50 rounded-lg border border-gray-700 animate-shimmer" />
                  </div>

                  {/* Breed skeleton */}
                  <div
                    className="animate-pulse-slow"
                    style={{ animationDelay: "150ms" }}
                  >
                    <p className="text-gray-500 text-xs mb-2">
                      Identifying breed...
                    </p>
                    <div className="h-10 bg-gray-800/50 rounded-lg border border-gray-700 animate-shimmer" />
                  </div>

                  {/* Traits skeleton */}
                  <div
                    className="animate-pulse-slow"
                    style={{ animationDelay: "300ms" }}
                  >
                    <p className="text-gray-500 text-xs mb-2">
                      Analyzing personality traits...
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <div className="h-8 w-24 bg-gray-800/50 rounded-full border border-gray-700 animate-shimmer" />
                      <div className="h-8 w-32 bg-gray-800/50 rounded-full border border-gray-700 animate-shimmer" />
                      <div className="h-8 w-28 bg-gray-800/50 rounded-full border border-gray-700 animate-shimmer" />
                    </div>
                  </div>

                  {/* Quest skeleton */}
                  <div
                    className="animate-pulse-slow"
                    style={{ animationDelay: "450ms" }}
                  >
                    <p className="text-gray-500 text-xs mb-2">
                      Generating starter quest...
                    </p>
                    <div className="h-16 bg-gray-800/50 rounded-lg border border-gray-700 animate-shimmer" />
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation stage - Requirements: 6.1, 6.4, 6.5 */}
            {modalState.stage === "confirmation" && (
              <ConfirmationScreen
                parsedData={modalState.parsedData}
                onConfirm={handleConfirm}
                onRetry={handleRetry}
              />
            )}

            {/* Creating stage */}
            {modalState.stage === "creating" && (
              <div className="flex flex-col items-center justify-center min-h-[40vh] px-6">
                <div className="w-16 h-16 border-4 border-[#f5c35f] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-lg">Creating profile...</p>
                <p className="text-gray-500 text-sm mt-2 text-center">
                  Setting up stats and starter quest
                </p>
              </div>
            )}

            {/* Error stage - Requirements: 5.5 */}
            {modalState.stage === "error" && (
              <div className="flex flex-col items-center justify-center min-h-[40vh] px-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-400 text-lg font-medium mb-2">
                  Oops! Something went wrong
                </p>
                <p className="text-gray-400 text-sm text-center mb-6 max-w-md">
                  {modalState.message}
                </p>

                {/* Show preserved transcript if available - Requirements: 5.5 */}
                {modalState.preservedTranscript && (
                  <div className="mb-6 px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-700 max-w-md w-full">
                    <p className="text-gray-500 text-xs mb-1">
                      Your description:
                    </p>
                    <p className="text-gray-300 text-sm">
                      {modalState.preservedTranscript}
                    </p>
                  </div>
                )}

                {/* Action buttons - Requirements: 5.5 */}
                <div className="flex flex-col gap-3 w-full max-w-md">
                  {modalState.preservedTranscript ? (
                    <>
                      {/* Retry with same transcript */}
                      <button
                        onClick={handleRetryWithTranscript}
                        className="px-6 py-3 bg-[#f5c35f] hover:bg-[#f9dca0] rounded-lg text-[#121216] font-bold text-base transition-all active:scale-95"
                      >
                        Retry processing
                      </button>
                      {/* Record new description */}
                      <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium text-base transition-colors"
                      >
                        Record new description
                      </button>
                    </>
                  ) : (
                    /* Single retry button for voice errors */
                    <button
                      onClick={handleRetry}
                      className="px-6 py-3 bg-[#f5c35f] hover:bg-[#f9dca0] rounded-lg text-[#121216] font-bold text-base transition-all active:scale-95"
                    >
                      Try again
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add animation styles - Requirements: 10.2, 10.3 */}
      {/* Using CSS transforms for 60fps animations */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
          /* Use GPU acceleration for smooth 60fps animations */
          transform: translate3d(0, 0, 0);
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          background: linear-gradient(
            90deg,
            rgba(31, 41, 55, 0.5) 0%,
            rgba(55, 65, 81, 0.8) 50%,
            rgba(31, 41, 55, 0.5) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
