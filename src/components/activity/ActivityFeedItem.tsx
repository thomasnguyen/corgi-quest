import { formatRelativeTime } from "../../lib/utils";

interface StatGain {
  statType: "INT" | "PHY" | "IMP" | "SOC";
  xpAmount: number;
}

interface ActivityFeedItemProps {
  userName: string;
  activityName: string;
  description?: string;
  statGains: StatGain[];
  timestamp: number;
}

export default function ActivityFeedItem({
  userName,
  activityName,
  description,
  statGains,
  timestamp,
}: ActivityFeedItemProps) {
  return (
    <div className="bg-[#1a1a1e] border border-[#3d3d3d]/50 rounded-lg p-4">
      {/* User name with avatar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#f5c35f] flex items-center justify-center text-black font-bold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="text-[#feefd0] font-medium text-sm">{userName}</span>
      </div>

      {/* Activity name */}
      <h3 className="text-white font-semibold mb-1">{activityName}</h3>

      {/* Description if exists */}
      {description && (
        <p className="text-[#f9dca0] text-sm mb-2">{description}</p>
      )}

      {/* Stat gains */}
      {statGains && statGains.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {statGains.map((gain, index) => (
            <span
              key={index}
              className="text-xs bg-[#f5c35f]/20 text-[#f5c35f] px-2 py-1 rounded border border-[#f5c35f]/30"
            >
              {gain.statType} +{gain.xpAmount} XP
            </span>
          ))}
        </div>
      )}

      {/* Relative timestamp */}
      <p className="text-[#888] text-xs">{formatRelativeTime(timestamp)}</p>
    </div>
  );
}
