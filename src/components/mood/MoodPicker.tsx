import { useState } from "react";

export type MoodType =
  | "calm"
  | "anxious"
  | "reactive"
  | "playful"
  | "tired"
  | "neutral";

interface MoodOption {
  value: MoodType;
  emoji: string;
  label: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: "calm", emoji: "😊", label: "Calm/Relaxed" },
  { value: "anxious", emoji: "😰", label: "Anxious/Stressed" },
  { value: "reactive", emoji: "😡", label: "Reactive/Aggressive" },
  { value: "playful", emoji: "🎾", label: "Playful/Energetic" },
  { value: "tired", emoji: "😴", label: "Tired/Overwhelmed" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
];

interface MoodPickerProps {
  onConfirm: (mood: MoodType, note?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * MoodPicker component for logging dog's emotional state
 * Displays 6 mood options in a grid layout with optional note
 * Requirements: 26
 */
export default function MoodPicker({
  onConfirm,
  onCancel,
  isLoading = false,
}: MoodPickerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    if (selectedMood) {
      onConfirm(selectedMood, note.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 pt-20">
      <div className="bg-[#1a1a1e] border border-[#3d3d3d]/50 rounded-lg p-6 max-w-md w-full mt-8">
        {/* Header */}
        <h2 className="text-white font-semibold text-lg mb-4">
          How is Bumi feeling?
        </h2>

        {/* Mood options grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedMood(option.value)}
              disabled={isLoading}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedMood === option.value
                  ? "border-[#f5c35f] bg-[#f5c35f]/10"
                  : "border-[#3d3d3d]/50 bg-[#1a1a1e]/50 hover:border-[#f5c35f]/50"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="text-4xl mb-2">{option.emoji}</span>
              <span className="text-[#f9dca0] text-sm text-center">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        {/* Optional note textarea */}
        <div className="mb-4">
          <label
            htmlFor="mood-note"
            className="block text-[#f9dca0] text-sm mb-2"
          >
            Add a note (optional)
          </label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 200))}
            maxLength={200}
            disabled={isLoading}
            placeholder="Any details about Bumi's mood..."
            className="w-full bg-[#121216] border border-[#3d3d3d]/50 rounded-lg p-3 text-white text-sm placeholder-[#888] focus:outline-none focus:border-[#f5c35f]/50 resize-none"
            rows={3}
          />
          <div className="text-[#888] text-xs mt-1 text-right">
            {note.length}/200
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-[#121216] border border-[#3d3d3d]/50 text-[#f9dca0] py-3 rounded-lg font-medium hover:border-[#f5c35f]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedMood || isLoading}
            className="flex-1 bg-[#f5c35f] text-[#121216] py-3 rounded-lg font-semibold hover:bg-[#f5c35f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging..." : "Log Mood"}
          </button>
        </div>
      </div>
    </div>
  );
}
