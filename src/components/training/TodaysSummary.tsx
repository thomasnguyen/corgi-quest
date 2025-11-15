import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface TodaysSummaryProps {
  dogId: string;
}

export function TodaysSummary({ dogId }: TodaysSummaryProps) {
  const dailyGoals = useQuery(api.queries.getDailyGoals, {
    dogId: dogId as any,
  });
  const streak = useQuery(api.queries.getStreak, { dogId: dogId as any });

  if (!dailyGoals) {
    return null;
  }

  return (
    <div className="px-6 py-4">
      <h3 className="text-[#f5c35f] text-sm font-semibold mb-2">
        Today's Progress
      </h3>
      <div className="flex items-center justify-around bg-[#1a1a1e] rounded-lg p-4">
        <div className="text-center">
          <p className="text-2xl">💪</p>
          <p className="text-white text-sm mt-1">
            {dailyGoals.physicalPoints}/{dailyGoals.physicalGoal}
          </p>
          <p className="text-gray-500 text-xs">Physical</p>
        </div>
        <div className="text-center">
          <p className="text-2xl">🧠</p>
          <p className="text-white text-sm mt-1">
            {dailyGoals.mentalPoints}/{dailyGoals.mentalGoal}
          </p>
          <p className="text-gray-500 text-xs">Mental</p>
        </div>
        <div className="text-center">
          <p className="text-2xl">🔥</p>
          <p className="text-white text-sm mt-1">
            {streak?.currentStreak || 0} days
          </p>
          <p className="text-gray-500 text-xs">Streak</p>
        </div>
      </div>
    </div>
  );
}
