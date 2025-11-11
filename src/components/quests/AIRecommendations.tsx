import { useState, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  RefreshCw,
  Zap,
  Brain,
  Shield,
  Users,
  Lightbulb,
  AlertCircle,
} from "lucide-react";

interface Recommendation {
  activityName: string;
  reasoning: string;
  expectedMoodImpact: string;
  statGains: Array<{
    statType: "INT" | "PHY" | "IMP" | "SOC";
    xpAmount: number;
  }>;
  physicalPoints: number;
  mentalPoints: number;
  durationMinutes?: number;
}

// Helper function to format relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else {
    return "today";
  }
}

export default function AIRecommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, setTick] = useState(0); // Force re-render for relative time updates

  // Get first dog
  const firstDog = useQuery(api.queries.getFirstDog);

  // Update relative time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Get cached recommendations for today
  const cachedData = useQuery(
    api.queries.getCachedRecommendations,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Get the action and mutation
  const generateRecommendations = useAction(
    api.actions.generateRecommendations
  );
  const cacheRecommendations = useMutation(api.mutations.cacheRecommendations);

  // Load cached recommendations or generate new ones
  // Cache is automatically invalidated when new activities or moods are logged
  useEffect(() => {
    if (!firstDog) return;

    // If we have cached data, use it
    if (cachedData) {
      setRecommendations(cachedData.recommendations);
      setLastUpdated(new Date(cachedData.createdAt));
      setError(null);
    } else if (
      recommendations.length === 0 &&
      !isLoading &&
      !error &&
      cachedData === null
    ) {
      // No cache exists, generate new recommendations
      loadRecommendations();
    }
  }, [firstDog, cachedData]);

  const loadRecommendations = async () => {
    if (!firstDog) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateRecommendations({ dogId: firstDog._id });
      setRecommendations(result);
      const now = new Date();
      setLastUpdated(now);

      // Cache the recommendations
      await cacheRecommendations({
        dogId: firstDog._id,
        recommendations: JSON.stringify(result),
      });
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate recommendations. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRecommendations();
  };

  const handleLogActivity = (activityName: string) => {
    // Navigate to log-activity with activity name in search params
    navigate({
      to: "/log-activity",
      search: { prefilledActivity: activityName },
    });
  };

  // Get stat icon
  const getStatIcon = (statType: string) => {
    switch (statType) {
      case "INT":
        return (
          <Lightbulb size={14} strokeWidth={2} className="text-[#f5c35f]" />
        );
      case "PHY":
        return <Zap size={14} strokeWidth={2} className="text-[#f5c35f]" />;
      case "IMP":
        return <Shield size={14} strokeWidth={2} className="text-[#f5c35f]" />;
      case "SOC":
        return <Users size={14} strokeWidth={2} className="text-[#f5c35f]" />;
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-5 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#f5c35f] border-t-transparent mb-4"></div>
          <p className="text-[#f9dca0] text-sm">Analyzing patterns...</p>
          <p className="text-[#f9dca0]/60 text-xs mt-2">
            Reviewing mood logs and activity history
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-5 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-[#1a1a1e] border border-[#3d3d3d]/50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-[#f5c35f]" strokeWidth={2} />
          </div>
          <p className="text-[#feefd0] text-sm font-medium mb-2">
            Unable to Generate Recommendations
          </p>
          <p className="text-[#f9dca0] text-xs text-center max-w-xs mb-6">
            {error}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-[#f5c35f] text-[#121216] font-medium text-sm rounded-lg hover:bg-[#fcd587] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state (no recommendations)
  if (recommendations.length === 0) {
    return (
      <div className="px-5 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-[#1a1a1e] border border-[#3d3d3d]/50 rounded-full flex items-center justify-center mb-4">
            <Sparkles size={32} className="text-[#f5c35f]" strokeWidth={2} />
          </div>
          <p className="text-[#feefd0] text-sm font-medium mb-2">
            No Recommendations Yet
          </p>
          <p className="text-[#f9dca0] text-xs text-center max-w-xs mb-6">
            Log some activities and moods to get personalized recommendations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} strokeWidth={2} className="text-[#f5c35f]" />
          <h2 className="text-lg font-semibold text-[#feefd0]">
            AI RECOMMENDATIONS
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 bg-[#1a1a1e]/80 border border-[#3d3d3d]/50 rounded-lg hover:border-[#f5c35f]/50 transition-colors disabled:opacity-50"
          aria-label="Refresh recommendations"
        >
          <RefreshCw
            size={16}
            strokeWidth={2}
            className={`text-[#f5c35f] ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Last updated timestamp */}
      {lastUpdated && (
        <p className="text-[#f9dca0]/60 text-xs mb-4">
          Last updated: {getRelativeTime(lastUpdated)}
        </p>
      )}

      {/* Description */}
      <p className="text-[#f9dca0] text-sm leading-relaxed mb-6">
        Personalized activity suggestions based on Bumi's mood patterns, stat
        progress, and daily goals.
      </p>

      {/* Recommendations list */}
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#f5c35f]/30 rounded-lg p-4 relative"
          >
            {/* AI badge */}
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 bg-[#f5c35f]/20 border border-[#f5c35f]/50 px-2 py-0.5 rounded text-xs font-medium text-[#f5c35f]">
                <Sparkles size={10} strokeWidth={2} />
                AI
              </div>
            </div>

            {/* Activity name */}
            <h3 className="font-medium text-white text-sm mb-2 pr-12">
              {rec.activityName}
            </h3>

            {/* Reasoning */}
            <p className="text-[#f9dca0] text-xs leading-relaxed mb-3">
              {rec.reasoning}
            </p>

            {/* Expected mood impact */}
            <div className="mb-3 p-2 bg-[#121216]/50 border border-[#3d3d3d]/30 rounded">
              <p className="text-[#fcd587] text-xs">
                <span className="font-medium">Mood Impact:</span>{" "}
                {rec.expectedMoodImpact}
              </p>
            </div>

            {/* Stat gains and points */}
            <div className="flex flex-wrap gap-2 mb-3">
              {rec.statGains.map((gain, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-[#121216]/50 border border-[#3d3d3d]/30 px-2 py-1 rounded text-xs"
                >
                  {getStatIcon(gain.statType)}
                  <span className="text-[#f9dca0] font-medium">
                    {gain.statType}
                  </span>
                  <span className="text-[#f5c35f] font-mono">
                    +{gain.xpAmount} XP
                  </span>
                </div>
              ))}
            </div>

            {/* Points and duration */}
            <div className="flex items-center gap-3 mb-3 text-xs text-[#f9dca0]">
              {rec.physicalPoints > 0 && (
                <span className="flex items-center gap-1">
                  <Zap size={12} strokeWidth={2} className="text-[#f5c35f]" />
                  {rec.physicalPoints} physical
                </span>
              )}
              {rec.mentalPoints > 0 && (
                <span className="flex items-center gap-1">
                  <Brain size={12} strokeWidth={2} className="text-[#f5c35f]" />
                  {rec.mentalPoints} mental
                </span>
              )}
              {rec.durationMinutes && (
                <span className="text-[#f9dca0]/60">
                  ~{rec.durationMinutes} min
                </span>
              )}
            </div>

            {/* Log Activity button */}
            <button
              onClick={() => handleLogActivity(rec.activityName)}
              className="w-full py-2 bg-[#f5c35f] text-[#121216] font-medium text-sm rounded-lg hover:bg-[#fcd587] transition-colors"
            >
              Log Activity
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
