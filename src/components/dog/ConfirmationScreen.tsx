import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

export interface ParsedDogData {
  name: string;
  breed: string;
  traits: string[];
  starterQuest: {
    name: string;
    description: string;
    targetStat: "PHY" | "INT" | "IMP" | "SOC";
    reps: number;
  };
  initialStatEmphasis: {
    PHY: number;
    INT: number;
    IMP: number;
    SOC: number;
  };
}

interface ConfirmationScreenProps {
  parsedData: ParsedDogData;
  onConfirm: (editedName?: string) => void;
  onRetry: () => void;
}

/**
 * ConfirmationScreen component for reviewing AI-parsed dog data
 *
 * Displays parsed name (editable), breed, traits, and starter quest.
 * Allows user to confirm or retry the voice input.
 * Validates name is not empty before allowing confirmation.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function ConfirmationScreen({
  parsedData,
  onConfirm,
  onRetry,
}: ConfirmationScreenProps) {
  // Editable name state - Requirements: 6.2
  const [editedName, setEditedName] = useState(parsedData.name);

  // Validate name is not empty - Requirements: 6.3
  const isNameValid = editedName.trim().length > 0;

  // Handle confirmation - Requirements: 6.4
  const handleConfirm = () => {
    if (isNameValid) {
      onConfirm(editedName.trim());
    }
  };

  // Handle retry - Requirements: 6.5
  const handleRetry = () => {
    onRetry();
  };

  return (
    <div className="flex flex-col px-4 sm:px-6 py-6 sm:py-8 max-w-md mx-auto">
      {/* Title - Requirements: 10.4 */}
      <h2 className="text-xl sm:text-2xl font-bold text-[#f9dca0] mb-4 sm:mb-6 text-center">
        Does this look right?
      </h2>

      {/* Parsed dog name (editable) - Requirements: 6.1, 6.2, 10.4 */}
      <div className="mb-4 sm:mb-6">
        <label
          htmlFor="dog-name"
          className="block text-xs sm:text-sm font-medium text-gray-400 mb-2"
        >
          Dog Name
        </label>
        <input
          id="dog-name"
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-base sm:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#f5c35f] focus:border-transparent"
          placeholder="Enter dog name"
          autoComplete="off"
        />
        {!isNameValid && editedName.length > 0 && (
          <p className="text-red-400 text-xs mt-1">Name cannot be empty</p>
        )}
      </div>

      {/* Breed (read-only) - Requirements: 6.1, 10.4 */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
          Breed
        </label>
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/30 border border-gray-800 rounded-lg">
          <p className="text-gray-300 text-sm sm:text-base break-words">
            {parsedData.breed}
          </p>
        </div>
      </div>

      {/* Traits (read-only) - Requirements: 6.1, 10.4 */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
          Personality Traits
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {parsedData.traits.map((trait, index) => (
            <span
              key={index}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-800 border border-gray-700 rounded-full text-gray-300 text-xs sm:text-sm"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Starter quest (read-only) - Requirements: 6.1, 10.4 */}
      <div className="mb-6 sm:mb-8">
        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
          Starter Quest
        </label>
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/30 border border-gray-800 rounded-lg">
          <p className="text-white font-medium mb-1 text-sm sm:text-base break-words">
            {parsedData.starterQuest.name}
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mb-2 break-words">
            {parsedData.starterQuest.description}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
            <span className="px-2 py-1 bg-gray-800 rounded">
              {parsedData.starterQuest.targetStat}
            </span>
            <span>{parsedData.starterQuest.reps} reps</span>
          </div>
        </div>
      </div>

      {/* Action buttons - Requirements: 6.3, 10.4, 10.5 */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {/* "Looks good" button (primary) - Requirements: 6.3, 6.4, 10.5 */}
        <button
          onClick={handleConfirm}
          disabled={!isNameValid}
          className="w-full px-4 sm:px-6 py-3 min-h-[44px] bg-[#f5c35f] hover:bg-[#f9dca0] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg text-[#121216] font-bold text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center gap-2"
          aria-label="Confirm dog information"
        >
          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
          Looks good
        </button>

        {/* "Try again" button (secondary) - Requirements: 6.3, 6.5, 10.5 */}
        <button
          onClick={handleRetry}
          className="w-full px-4 sm:px-6 py-3 min-h-[44px] bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
          aria-label="Retry voice input"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
