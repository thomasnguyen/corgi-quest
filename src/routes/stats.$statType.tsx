import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import { ArrowLeft, Lightbulb, Zap, Shield, Users, Mic } from "lucide-react";
import { StatType } from "../lib/types";
import { formatRelativeTime } from "../lib/utils";
import { DURATION_ACTIVITIES, FIXED_ACTIVITIES } from "../lib/xpCalculations";

export const Route = createFileRoute("/stats/$statType")({
  component: StatDetailPage,
});

const STAT_NAMES: Record<StatType, string> = {
  INT: "Intelligence",
  PHY: "Physical",
  IMP: "Impulse Control",
  SOC: "Socialization",
};

const STAT_DESCRIPTIONS: Record<StatType, string> = {
  PHY: "Physical fitness keeps your dog healthy, strong, and full of energy. Regular exercise helps maintain a healthy weight and improves overall wellbeing.",
  INT: "Mental stimulation keeps your dog's mind sharp and engaged. Puzzle toys and training exercises help prevent boredom and build problem-solving skills.",
  IMP: "Impulse control teaches your dog patience and self-discipline. Training sessions help your dog learn to wait, listen, and make better decisions.",
  SOC: "Socialization helps your dog feel comfortable around people and other dogs. Positive interactions build confidence and reduce anxiety in new situations.",
};

const STAT_ICONS: Record<
  StatType,
  React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>
> = {
  INT: Lightbulb,
  PHY: Zap,
  IMP: Shield,
  SOC: Users,
};

// Suggested activities for each stat type
const SUGGESTED_ACTIVITIES: Record<StatType, string[]> = {
  PHY: ["Walk", "Run/Jog", "Fetch", "Swimming"],
  INT: ["Puzzle Toy", "Trick Practice", "Sniff Walk"],
  IMP: ["Training Session", "Fetch", "Tug-of-War"],
  SOC: ["Playdate", "Dog Park Visit", "Grooming"],
};

function StatDetailPage() {
  const { statType } = Route.useParams();
  const navigate = useNavigate();

  // Get the first dog (demo purposes)
  const firstDog = useQuery(api.queries.getFirstDog);

  // Get stat detail with recent activities
  const statDetail = useQuery(
    api.queries.getStatDetail,
    firstDog ? { dogId: firstDog._id, statType: statType as StatType } : "skip"
  );

  // Get potential XP for an activity
  const getActivityXp = (activityName: string): string => {
    if (activityName in DURATION_ACTIVITIES) {
      const activity =
        DURATION_ACTIVITIES[activityName as keyof typeof DURATION_ACTIVITIES];
      return `${activity.baseXpPer10Min} XP/10min`;
    }
    if (activityName in FIXED_ACTIVITIES) {
      const activity =
        FIXED_ACTIVITIES[activityName as keyof typeof FIXED_ACTIVITIES];
      return `${activity.xpAmount} XP`;
    }
    return "XP varies";
  };

  // Handle suggestion click
  const handleSuggestionClick = (activityName: string) => {
    navigate({
      to: "/log-activity",
      search: { prefilledActivity: activityName },
    });
  };

  // Loading state
  if (firstDog === undefined || statDetail === undefined) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-[#121216]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#f5c35f] border-t-transparent"></div>
            <p className="mt-4 text-[#f9dca0] text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // No stat found
  if (!firstDog || !statDetail) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-[#121216]">
          <div className="text-center px-6">
            <p className="text-[#f9dca0] text-sm">Stat not found.</p>
            <Link
              to="/"
              className="mt-4 inline-block text-[#f5c35f] hover:text-[#fcd587] transition-colors"
            >
              ← Back to Overview
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const { stat, recentActivities } = statDetail;
  const statName = STAT_NAMES[stat.statType];
  const xpPercentage = (stat.xp / stat.xpToNextLevel) * 100;

  return (
    <Layout>
      <div className="relative min-h-screen bg-[#121216] pb-32">
        {/* Background atmospheric effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-[#492e25]/20 via-[#2f2120]/20 to-[#141b1b]/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header with Back Button */}
          <div className="px-5 pt-5 pb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#f9dca0] hover:text-[#fcd587] transition-colors mb-4"
            >
              <ArrowLeft size={20} strokeWidth={2} />
              <span className="text-sm font-medium">Back</span>
            </Link>

            {/* Stat Name and Level */}
            <div className="text-center mb-6">
              <p
                className="text-[#feefd0] text-sm mb-1"
                style={{ textShadow: "0px 1px 1px #1e1e1e" }}
              >
                Lvl {stat.level}
              </p>
              <div className="flex items-center justify-center gap-3 mb-3">
                {(() => {
                  const Icon = STAT_ICONS[stat.statType];
                  return (
                    <Icon
                      size={32}
                      strokeWidth={2}
                      className="text-[#fcd587]"
                    />
                  );
                })()}
                <h1
                  className="text-3xl font-bold text-[#fcd587]"
                  style={{
                    textShadow: "0px 1px 1px #1e1e1e",
                  }}
                >
                  {statName}
                </h1>
              </div>
              {/* Stat Description */}
              <p className="text-[#f9dca0] text-sm leading-relaxed px-4 max-w-md mx-auto">
                {STAT_DESCRIPTIONS[stat.statType]}
              </p>
            </div>

            {/* Large XP Progress Bar */}
            <div className="bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#3d3d3d]/50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#f5c35f] font-medium">XP Progress</span>
                <span className="text-white font-mono">
                  {stat.xp} / {stat.xpToNextLevel}
                </span>
              </div>
              <div className="h-3 bg-[#0c0b0b]/80 border border-white/20 rounded-sm overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-[#c6a755] to-[#fff1ab] transition-all duration-300"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
              <div className="text-center">
                <span className="text-[#f9dca0] text-xs font-medium">
                  {Math.round(xpPercentage)}% Complete
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activities Section */}
          <div className="px-5 mt-6">
            <h2 className="text-[#feefd0] text-lg font-semibold mb-3">
              Recent Activities
            </h2>

            {recentActivities.length === 0 ? (
              <div className="bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#3d3d3d]/50 rounded-lg p-6 text-center">
                <p className="text-[#888] text-sm">
                  No activities for this stat yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#3d3d3d]/50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm mb-1">
                          {activity.activityName}
                        </h3>
                        <p className="text-[#f9dca0] text-xs">
                          {formatRelativeTime(activity._creationTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#f5c35f] font-bold text-sm">
                          +{activity.xpAmount} XP
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Activities Section */}
          <div className="px-5 mt-6 pb-6">
            <h2 className="text-[#feefd0] text-lg font-semibold mb-3">
              Suggested Activities
            </h2>

            <div className="space-y-2">
              {SUGGESTED_ACTIVITIES[stat.statType].map((activityName) => (
                <button
                  key={activityName}
                  onClick={() => handleSuggestionClick(activityName)}
                  className="w-full bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#3d3d3d]/50 rounded-lg p-4 hover:border-[#f5c35f]/50 hover:bg-[#1a1a1e] transition-all duration-200 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center gap-3">
                      <Mic
                        size={18}
                        strokeWidth={2}
                        className="text-[#f5c35f] flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-white font-medium text-sm mb-1">
                          {activityName}
                        </h3>
                        <p className="text-[#f9dca0] text-xs">
                          Tap to log this activity
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#f5c35f] font-bold text-sm">
                        {getActivityXp(activityName)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
