interface LastLoggedActivityProps {
  activity: {
    name: string;
    xpGains: Array<{ statType: string; xpAmount: number }>;
    timestamp: number;
  };
}

function getStatEmoji(statType: string): string {
  const emojiMap: Record<string, string> = {
    INT: "🧠",
    PHY: "💪",
    IMP: "❤️",
    SOC: "👥",
  };
  return emojiMap[statType] || "⭐";
}

function getStatName(statType: string): string {
  const nameMap: Record<string, string> = {
    INT: "Mental",
    PHY: "Physical",
    IMP: "Emotional",
    SOC: "Social",
  };
  return nameMap[statType] || statType;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function LastLoggedActivity({ activity }: LastLoggedActivityProps) {
  const timeAgo = formatTimeAgo(activity.timestamp);

  return (
    <div className="px-6 py-4">
      <div className="bg-[#1a1a1e] rounded-lg p-4">
        <h3 className="text-[#f5c35f] text-sm font-semibold mb-2">
          Last Logged
        </h3>
        <div className="flex items-start gap-2">
          <span className="text-green-500 text-xl">✅</span>
          <div className="flex-1">
            <p className="text-white font-medium">{activity.name}</p>
            <p className="text-[#f9dca0] text-sm mt-1">
              {activity.xpGains
                .map(
                  (gain) =>
                    `+${gain.xpAmount} ${getStatEmoji(gain.statType)} ${getStatName(gain.statType)}`
                )
                .join(", ")}
            </p>
            <p className="text-gray-500 text-xs mt-1">{timeAgo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
