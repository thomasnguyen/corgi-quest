import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Dumbbell, Brain } from "lucide-react";

interface Activity {
  _id: Id<"activities">;
  activityName: string;
  userName: string;
  userId: Id<"users">;
  physicalPoints?: number;
  mentalPoints?: number;
}

interface User {
  _id: Id<"users">;
  name: string;
}

interface TodaysBreakdownProps {
  activities: Activity[];
  users: User[];
}

export default function TodaysBreakdown({
  activities,
  users,
}: TodaysBreakdownProps) {
  const [selectedUser, setSelectedUser] = useState<"all" | Id<"users">>("all");

  // Filter activities by selected user
  const filteredActivities =
    selectedUser === "all"
      ? activities
      : activities.filter((a) => a.userId === selectedUser);

  // Group activities by Physical vs Mental
  const physicalActivities = filteredActivities.filter(
    (a) => (a.physicalPoints ?? 0) > 0
  );
  const mentalActivities = filteredActivities.filter(
    (a) => (a.mentalPoints ?? 0) > 0
  );

  // Calculate totals
  const totalPhysical = filteredActivities.reduce(
    (sum, a) => sum + (a.physicalPoints ?? 0),
    0
  );
  const totalMental = filteredActivities.reduce(
    (sum, a) => sum + (a.mentalPoints ?? 0),
    0
  );

  return (
    <div className="mb-8">
      {/* Header with filter */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#feefd0]">Today's Breakdown</h2>

        {/* User filter dropdown */}
        <select
          value={selectedUser}
          onChange={(e) =>
            setSelectedUser(
              e.target.value === "all" ? "all" : (e.target.value as Id<"users">)
            )
          }
          className="bg-[#1a1a1e] border border-[#3d3d3d]/50 text-[#feefd0] px-3 py-1.5 rounded text-sm focus:outline-none focus:border-[#f5c35f]/50"
        >
          <option value="all">All</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#888] text-sm">No activities logged today</p>
        </div>
      )}

      {/* Two column layout */}
      {filteredActivities.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {/* Physical column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-5 h-5 text-[#f5c35f]" strokeWidth={2} />
              <h3 className="text-sm font-semibold text-[#feefd0]">
                Physical ({totalPhysical} pts)
              </h3>
            </div>
            <div className="space-y-2">
              {physicalActivities.length === 0 ? (
                <p className="text-[#888] text-xs">None yet</p>
              ) : (
                physicalActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-[#1a1a1e] border border-[#3d3d3d]/50 rounded p-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#feefd0] text-xs font-medium truncate">
                          {activity.activityName}
                        </p>
                        <p className="text-[#888] text-xs">
                          {activity.userName}
                        </p>
                      </div>
                      <span className="text-[#f5c35f] text-xs font-semibold whitespace-nowrap">
                        +{activity.physicalPoints ?? 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mental column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-[#f5c35f]" strokeWidth={2} />
              <h3 className="text-sm font-semibold text-[#feefd0]">
                Mental ({totalMental} pts)
              </h3>
            </div>
            <div className="space-y-2">
              {mentalActivities.length === 0 ? (
                <p className="text-[#888] text-xs">None yet</p>
              ) : (
                mentalActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-[#1a1a1e] border border-[#3d3d3d]/50 rounded p-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#feefd0] text-xs font-medium truncate">
                          {activity.activityName}
                        </p>
                        <p className="text-[#888] text-xs">
                          {activity.userName}
                        </p>
                      </div>
                      <span className="text-[#f5c35f] text-xs font-semibold whitespace-nowrap">
                        +{activity.mentalPoints ?? 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
