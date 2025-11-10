import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Flame, Dumbbell, Brain, WifiOff, RefreshCw } from "lucide-react";
import { useConvexConnection } from "../../hooks/useConvexConnection";

export default function TopResourceBar() {
  // Monitor Convex connection state
  const { connectionState, hasPendingMutations } = useConvexConnection();
  // Get the first dog (demo purposes)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Get the first user (current user for demo purposes)
  const firstUser = useQuery(
    api.queries.getFirstUser,
    firstDog ? { householdId: firstDog.householdId } : "skip"
  );

  // Subscribe to daily goals query
  const dailyGoals = useQuery(
    api.queries.getDailyGoals,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Subscribe to streak query
  const streak = useQuery(
    api.queries.getStreak,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Subscribe to partner's presence
  const partnerPresence = useQuery(
    api.queries.getPartnerPresence,
    firstDog && firstUser
      ? { householdId: firstDog.householdId, currentUserId: firstUser._id }
      : "skip"
  );

  // Show loading state if queries are still loading
  // Only check firstDog since other queries depend on it
  if (firstDog === undefined) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Flame size={16} strokeWidth={2} className="text-orange-500" />
            <span className="text-[#f9dca0] text-xs font-medium">0</span>
          </div>
          <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Dumbbell size={16} strokeWidth={2} className="text-cyan-400" />
            <span className="text-[#f9dca0] text-xs font-medium">0/50</span>
          </div>
          <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
            <Brain size={16} strokeWidth={2} className="text-purple-400" />
            <span className="text-[#f9dca0] text-xs font-medium">0/30</span>
          </div>
        </div>
      </div>
    );
  }

  // Extract values with defaults when no daily goal exists
  const physicalPoints = dailyGoals?.physicalPoints ?? 0;
  const physicalGoal = dailyGoals?.physicalGoal ?? 50;
  const mentalPoints = dailyGoals?.mentalPoints ?? 0;
  const mentalGoal = dailyGoals?.mentalGoal ?? 30;
  const currentStreak = streak?.currentStreak ?? 0;

  // Check if partner is logging activity
  const isPartnerLogging =
    partnerPresence?.location === "log-activity" && partnerPresence.partnerName;

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
          <Flame size={16} strokeWidth={2} className="text-orange-500" />
          <span className="text-[#f9dca0] text-xs font-medium">
            {currentStreak}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
          <Dumbbell size={16} strokeWidth={2} className="text-cyan-400" />
          <span className="text-[#f9dca0] text-xs font-medium">
            {physicalPoints}/{physicalGoal}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#3d3d3d]/30">
          <Brain size={16} strokeWidth={2} className="text-purple-400" />
          <span className="text-[#f9dca0] text-xs font-medium">
            {mentalPoints}/{mentalGoal}
          </span>
        </div>
      </div>
      {/* Syncing Indicator - Shows when mutations are pending */}
      {hasPendingMutations && (
        <div className="px-5 pb-2">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-500/30 flex items-center gap-2">
            <RefreshCw size={12} className="text-yellow-400 animate-spin" />
            <span className="text-yellow-400 text-xs font-medium">
              Syncing...
            </span>
          </div>
        </div>
      )}
      {/* Reconnecting Indicator */}
      {connectionState === "reconnecting" && !hasPendingMutations && (
        <div className="px-5 pb-2">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-500/30 flex items-center gap-2">
            <RefreshCw size={12} className="text-yellow-400 animate-spin" />
            <span className="text-yellow-400 text-xs font-medium">
              Reconnecting...
            </span>
          </div>
        </div>
      )}
      {/* Offline Indicator */}
      {connectionState === "disconnected" && (
        <div className="px-5 pb-2">
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-red-500/30 flex items-center gap-2">
            <WifiOff size={12} className="text-red-400" />
            <span className="text-red-400 text-xs font-medium">
              Offline - Changes will sync when online
            </span>
          </div>
        </div>
      )}
      {/* Partner Logging Indicator */}
      {isPartnerLogging && (
        <div className="px-5 pb-2">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-500/30 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-xs font-medium">
              {partnerPresence.partnerName} is logging...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
