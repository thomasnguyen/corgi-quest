import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MoodPicker, { type MoodType } from "./MoodPicker";
import type { Id } from "../../../convex/_generated/dataModel";

interface MoodReminderPopupProps {
  dogId: Id<"dogs">;
  userId: Id<"users">;
  onDismiss: (type: "full" | "remindLater") => void;
}

/**
 * Popup reminder to log mood after 6pm if not logged today
 * Shows mood picker inline or provides quick action buttons
 * Requirements: 26
 */
export default function MoodReminderPopup({
  dogId,
  userId,
  onDismiss,
}: MoodReminderPopupProps) {
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logMood = useMutation(api.mutations.logMood);

  const handleLogMoodNow = () => {
    setShowMoodPicker(true);
  };

  const handleRemindLater = () => {
    onDismiss("remindLater");
  };

  const handleDismiss = () => {
    onDismiss("full");
  };

  const handleMoodConfirm = async (mood: MoodType, note?: string) => {
    setIsLoading(true);
    try {
      await logMood({
        dogId,
        userId,
        mood,
        note,
      });
      // Close the popup after mood is logged
      onDismiss("full");
    } catch (error) {
      console.error("Failed to log mood:", error);
      setIsLoading(false);
    }
  };

  const handleMoodPickerCancel = () => {
    // User closed mood picker without logging
    setShowMoodPicker(false);
  };

  // If mood picker is open, show it
  if (showMoodPicker) {
    return (
      <MoodPicker
        onConfirm={handleMoodConfirm}
        onCancel={handleMoodPickerCancel}
        isLoading={isLoading}
      />
    );
  }

  // Show reminder popup
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#1a1a1f] border-2 border-[#f5c35f] rounded-lg p-6 max-w-sm w-full">
        {/* Title */}
        <h2 className="text-[#f9dca0] text-xl font-bold text-center mb-4">
          How is Bumi feeling today?
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-center mb-6">
          You haven't logged Bumi's mood yet today. Tracking mood helps us
          understand patterns and provide better recommendations.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Log Mood Now */}
          <button
            onClick={handleLogMoodNow}
            className="w-full bg-[#f5c35f] text-[#121216] font-bold py-3 px-4 rounded-lg hover:bg-[#f5c35f]/90 transition-colors"
          >
            Log Mood Now
          </button>

          {/* Remind Me Later */}
          <button
            onClick={handleRemindLater}
            className="w-full bg-transparent border-2 border-[#f5c35f] text-[#f9dca0] font-bold py-3 px-4 rounded-lg hover:bg-[#f5c35f]/10 transition-colors"
          >
            Remind Me Later (2 hours)
          </button>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="w-full bg-transparent text-gray-400 font-medium py-2 px-4 rounded-lg hover:text-[#f9dca0] transition-colors"
          >
            Dismiss for Today
          </button>
        </div>
      </div>
    </div>
  );
}
