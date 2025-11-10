import { formatRelativeTime } from "../../lib/utils";

interface MoodFeedItemProps {
  userName: string;
  mood: "calm" | "anxious" | "reactive" | "playful" | "tired" | "neutral";
  note?: string;
  timestamp: number;
}

const MOOD_CONFIG = {
  calm: { emoji: "😊", label: "Calm/Relaxed" },
  anxious: { emoji: "😰", label: "Anxious/Stressed" },
  reactive: { emoji: "😡", label: "Reactive/Aggressive" },
  playful: { emoji: "🎾", label: "Playful/Energetic" },
  tired: { emoji: "😴", label: "Tired/Overwhelmed" },
  neutral: { emoji: "😐", label: "Neutral" },
};

export default function MoodFeedItem({
  userName,
  mood,
  note,
  timestamp,
}: MoodFeedItemProps) {
  const moodInfo = MOOD_CONFIG[mood];

  return (
    <div className="bg-[#1e1a2e] border-2 border-[#6b5b95]/40 rounded-lg p-4">
      {/* User name with avatar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#9b8fc9] flex items-center justify-center text-black font-bold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="text-[#e8dff5] font-medium text-sm">{userName}</span>
      </div>

      {/* Mood emoji and label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-3xl">{moodInfo.emoji}</span>
        <h3 className="text-white font-semibold">Bumi is {moodInfo.label}</h3>
      </div>

      {/* Optional note */}
      {note && <p className="text-[#d4c5f9] text-sm mb-2 italic">"{note}"</p>}

      {/* Relative timestamp */}
      <p className="text-[#888] text-xs">{formatRelativeTime(timestamp)}</p>
    </div>
  );
}
