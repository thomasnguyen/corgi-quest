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
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { fetchTrainingTips } from "@/routes/api/fetch-tips";

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

interface TrainingTip {
  title: string;
  description: string;
  keyPoints: string[];
  source: string;
  topic: string;
  fetchedAt: string;
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

  // Firecrawl tips state
  const [firecrawlTips, setFirecrawlTips] = useState<TrainingTip[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);
  const [tipsLastUpdated, setTipsLastUpdated] = useState<Date | null>(null);

  // Collapsible sections state
  const [isTipsExpanded, setIsTipsExpanded] = useState(true);
  const [isRecommendationsExpanded, setIsRecommendationsExpanded] =
    useState(true);

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

  // Get cached Firecrawl tips for today
  const cachedTipsData = useQuery(
    api.queries.getCachedFirecrawlTips,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Get the action and mutation
  const generateRecommendations = useAction(
    api.actions.generateRecommendations
  );
  const cacheRecommendations = useMutation(api.mutations.cacheRecommendations);
  const cacheFirecrawlTips = useMutation(api.mutations.cacheFirecrawlTips);

  // Load cached recommendations (only generate if explicitly requested via refresh)
  useEffect(() => {
    if (!firstDog) return;

    // If we have cached data, use it
    if (cachedData) {
      setRecommendations(cachedData.recommendations);
      setLastUpdated(new Date(cachedData.createdAt));
      setError(null);
    }
    // Don't auto-generate if no cache exists - user must click refresh
  }, [firstDog, cachedData]);

  // Load cached Firecrawl tips (only fetch if explicitly requested via button)
  useEffect(() => {
    if (!firstDog) return;

    // If we have cached tips, use them
    if (cachedTipsData) {
      setFirecrawlTips(cachedTipsData.tips);
      setTipsLastUpdated(new Date(cachedTipsData.createdAt));
      setTipsError(null);
    }
    // Don't auto-fetch if no cache exists - user must click button
  }, [firstDog, cachedTipsData]);

  const loadRecommendations = async () => {
    if (!firstDog) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateRecommendations({ dogId: firstDog._id });

      // Handle empty results
      if (!result || result.length === 0) {
        setError(
          "No recommendations available. Log some activities and moods to get personalized suggestions."
        );
        setRecommendations([]);
        return;
      }

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

      // Provide user-friendly error messages
      let errorMessage =
        "Failed to generate recommendations. Please try again.";

      if (err instanceof Error) {
        // Use the error message from the action if it's user-friendly
        if (
          err.message.includes("Rate limit") ||
          err.message.includes("authentication") ||
          err.message.includes("temporarily unavailable") ||
          err.message.includes("Network error") ||
          err.message.includes("not configured")
        ) {
          errorMessage = err.message;
        } else if (err.message.includes("No recommendations generated")) {
          errorMessage =
            "Unable to generate recommendations. Try logging more activities and moods first.";
        } else {
          // Generic error with hint
          errorMessage = `${err.message}. If this persists, try again later.`;
        }
      }

      setError(errorMessage);
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

  const handleFetchTips = async () => {
    if (!firstDog) return;

    setIsLoadingTips(true);
    setTipsError(null);

    try {
      const tips = await fetchTrainingTips({
        data: {
          topics: ["basic-training", "socialization", "impulse-control"],
        },
      });
      setFirecrawlTips(tips);
      const now = new Date();
      setTipsLastUpdated(now);

      // Cache the tips
      await cacheFirecrawlTips({
        dogId: firstDog._id,
        tips: JSON.stringify(tips),
      });
    } catch (err) {
      console.error("Failed to fetch tips:", err);
      setTipsError(
        err instanceof Error
          ? err.message
          : "Failed to fetch training tips. Please try again."
      );
    } finally {
      setIsLoadingTips(false);
    }
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
    // Determine if this is a rate limit or network error for specific messaging
    const isRateLimit = error.includes("Rate limit");
    const isNetworkError = error.includes("Network error");
    const isConfigError = error.includes("not configured");

    return (
      <div className="px-5 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-[#1a1a1e] border border-[#3d3d3d]/50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-[#f5c35f]" strokeWidth={2} />
          </div>
          <p className="text-[#feefd0] text-sm font-medium mb-2">
            {isRateLimit
              ? "Too Many Requests"
              : isNetworkError
                ? "Connection Error"
                : isConfigError
                  ? "Configuration Error"
                  : "Unable to Generate Recommendations"}
          </p>
          <p className="text-[#f9dca0] text-xs text-center max-w-xs mb-4">
            {error}
          </p>

          {/* Additional help text for specific errors */}
          {isRateLimit && (
            <p className="text-[#f9dca0]/60 text-xs text-center max-w-xs mb-6">
              Wait a few moments before trying again
            </p>
          )}
          {isNetworkError && (
            <p className="text-[#f9dca0]/60 text-xs text-center max-w-xs mb-6">
              Check your connection and try again
            </p>
          )}
          {!isConfigError && (
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-[#f5c35f] text-[#121216] font-medium text-sm rounded-lg hover:bg-[#fcd587] transition-colors"
            >
              Try Again
            </button>
          )}
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
            Click the refresh button above to generate AI-powered activity
            recommendations
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-[#f5c35f] text-[#121216] font-medium text-sm rounded-lg hover:bg-[#fcd587] transition-colors flex items-center gap-2"
          >
            <Sparkles size={16} strokeWidth={2} />
            Generate Recommendations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      {/* Firecrawl Tips Section - Collapsible */}
      <div className="mb-6">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsTipsExpanded(!isTipsExpanded)}
          className="w-full flex items-center justify-between p-4 bg-[#1a1a1e]/80 border border-[#3d3d3d]/50 rounded-lg hover:border-[#f5c35f]/50 transition-all mb-3"
        >
          <div className="flex items-center gap-3">
            {isTipsExpanded ? (
              <ChevronUp size={20} className="text-[#f5c35f]" />
            ) : (
              <ChevronDown size={20} className="text-[#f5c35f]" />
            )}
            <Globe size={20} strokeWidth={2} className="text-[#f5c35f]" />
            <div className="text-left">
              <h2 className="text-lg font-semibold text-[#feefd0]">
                TRAINING TIPS
              </h2>
              <p className="text-xs text-[#f9dca0]/60">
                {firecrawlTips.length > 0
                  ? `${firecrawlTips.length} tip${firecrawlTips.length !== 1 ? "s" : ""} available`
                  : "Powered by Firecrawl & Cloudflare"}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFetchTips();
            }}
            disabled={isLoadingTips}
            className="px-4 py-2 bg-[#f5c35f] text-[#121216] font-medium text-sm rounded-lg hover:bg-[#fcd587] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingTips ? (
              <>
                <RefreshCw size={16} strokeWidth={2} className="animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <Globe size={16} strokeWidth={2} />
                <span>Fetch Tips</span>
              </>
            )}
          </button>
        </button>

        {/* Collapsible Content */}
        {isTipsExpanded && (
          <div className="pl-2">
            <p className="text-[#f9dca0] text-sm leading-relaxed mb-4">
              Get fresh dog training tips powered by Firecrawl and Cloudflare.
            </p>

            {/* Last updated timestamp */}
            {tipsLastUpdated && (
              <p className="text-[#f9dca0]/60 text-xs mb-4">
                Fetched: {getRelativeTime(tipsLastUpdated)} • Cached for today
              </p>
            )}

            {tipsError && (
              <div className="mb-4 p-3 bg-[#1a1a1e]/80 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-xs">{tipsError}</p>
              </div>
            )}

            {firecrawlTips.length > 0 && (
              <div className="space-y-3">
                {firecrawlTips.map((tip, index) => (
                  <div
                    key={index}
                    className="bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#3d3d3d]/50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white text-sm flex-1">
                        {tip.title}
                      </h3>
                      <div className="flex items-center gap-1 bg-[#3d3d3d]/50 px-2 py-0.5 rounded text-xs font-medium text-[#f9dca0] ml-2">
                        <Globe size={10} strokeWidth={2} />
                        {tip.source}
                      </div>
                    </div>
                    <p className="text-[#f9dca0] text-xs leading-relaxed mb-3">
                      {tip.description}
                    </p>
                    {tip.keyPoints.length > 0 && (
                      <ul className="space-y-1 mb-3">
                        {tip.keyPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="text-[#fcd587] text-xs flex items-start gap-2"
                          >
                            <span className="text-[#f5c35f] mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      onClick={() => handleLogActivity(tip.title)}
                      className="w-full py-2 bg-[#3d3d3d]/50 text-[#f9dca0] font-medium text-sm rounded-lg hover:bg-[#3d3d3d] transition-colors border border-[#3d3d3d]"
                    >
                      Log as Activity
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingTips && firecrawlTips.length === 0 && !tipsError && (
              <div className="text-center py-8 bg-[#1a1a1e]/50 border border-[#3d3d3d]/50 rounded-lg">
                <Globe size={32} className="text-[#3d3d3d] mx-auto mb-2" />
                <p className="text-[#f9dca0]/60 text-xs">
                  Click "Fetch Tips" to get training ideas
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Recommendations Section - Collapsible */}
      <div className="mb-6">
        {/* Collapsible Header */}
        <button
          onClick={() =>
            setIsRecommendationsExpanded(!isRecommendationsExpanded)
          }
          className="w-full flex items-center justify-between p-4 bg-[#1a1a1e]/80 border border-[#3d3d3d]/50 rounded-lg hover:border-[#f5c35f]/50 transition-all mb-3"
        >
          <div className="flex items-center gap-3">
            {isRecommendationsExpanded ? (
              <ChevronUp size={20} className="text-[#f5c35f]" />
            ) : (
              <ChevronDown size={20} className="text-[#f5c35f]" />
            )}
            <Sparkles size={20} strokeWidth={2} className="text-[#f5c35f]" />
            <div className="text-left">
              <h2 className="text-lg font-semibold text-[#feefd0]">
                AI RECOMMENDATIONS
              </h2>
              <p className="text-xs text-[#f9dca0]/60">
                {recommendations.length > 0
                  ? `${recommendations.length} personalized suggestion${recommendations.length !== 1 ? "s" : ""}`
                  : "Personalized activity suggestions"}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
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
        </button>

        {/* Collapsible Content */}
        {isRecommendationsExpanded && (
          <div className="pl-2">
            {/* Last updated timestamp */}
            {lastUpdated && (
              <p className="text-[#f9dca0]/60 text-xs mb-4">
                Generated: {getRelativeTime(lastUpdated)} • Cached for today
              </p>
            )}

            {/* Description */}
            <p className="text-[#f9dca0] text-sm leading-relaxed mb-6">
              Personalized activity suggestions based on Bumi's mood patterns,
              stat progress, and daily goals. Recommendations are cached daily.
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
                        <Zap
                          size={12}
                          strokeWidth={2}
                          className="text-[#f5c35f]"
                        />
                        {rec.physicalPoints} physical
                      </span>
                    )}
                    {rec.mentalPoints > 0 && (
                      <span className="flex items-center gap-1">
                        <Brain
                          size={12}
                          strokeWidth={2}
                          className="text-[#f5c35f]"
                        />
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
        )}
      </div>
    </div>
  );
}
