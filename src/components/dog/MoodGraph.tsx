import { Id } from "convex/_generated/dataModel";

type Mood = "calm" | "anxious" | "reactive" | "playful" | "tired" | "neutral";

interface MoodLog {
  _id: Id<"mood_logs">;
  dogId: Id<"dogs">;
  userId: Id<"users">;
  mood: Mood;
  note?: string;
  activityId?: Id<"activities">;
  createdAt: number;
  userName: string;
}

interface MoodGraphProps {
  moodLogs: MoodLog[];
  days?: number;
}

// Map moods to numeric values for plotting (0-5 scale)
const MOOD_VALUES: Record<Mood, number> = {
  reactive: 0, // Very negative
  anxious: 1, // Negative
  tired: 2, // Slightly negative
  neutral: 3, // Neutral
  playful: 4, // Positive
  calm: 5, // Very positive
};

// Mood labels for display
const MOOD_LABELS: Record<Mood, string> = {
  calm: "Calm",
  anxious: "Anxious",
  reactive: "Reactive",
  playful: "Playful",
  tired: "Tired",
  neutral: "Neutral",
};

export default function MoodGraph({ moodLogs, days = 7 }: MoodGraphProps) {
  if (moodLogs.length === 0) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-lg p-6">
        <h3 className="text-white text-center text-sm font-semibold mb-4 uppercase tracking-wide">
          Mood History ({days} Days)
        </h3>
        <div className="flex items-center justify-center h-48">
          <p className="text-white/60 text-sm">No mood data available</p>
        </div>
      </div>
    );
  }

  // Chart dimensions
  const width = 280;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate time range
  const now = Date.now();
  const startTime = now - days * 24 * 60 * 60 * 1000;
  const timeRange = now - startTime;

  // Convert mood logs to points
  const points = moodLogs.map((log) => {
    const x =
      padding.left +
      ((log.createdAt - startTime) / timeRange) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      (MOOD_VALUES[log.mood] / 5) * chartHeight;
    return { x, y, mood: log.mood, createdAt: log.createdAt };
  });

  // Generate path for line
  const pathData = points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `L ${point.x} ${point.y}`;
    })
    .join(" ");

  // Generate area path (for fill)
  const areaPathData =
    pathData +
    ` L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Format date for x-axis labels
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return `${month} ${day}`;
  };

  // Generate x-axis labels (show first, middle, last)
  const xAxisLabels: Array<{ x: number; label: string }> = [];
  if (points.length > 0) {
    xAxisLabels.push({
      x: points[0].x,
      label: formatDate(points[0].createdAt),
    });
    if (points.length > 2) {
      const midIndex = Math.floor(points.length / 2);
      xAxisLabels.push({
        x: points[midIndex].x,
        label: formatDate(points[midIndex].createdAt),
      });
    }
    if (points.length > 1) {
      xAxisLabels.push({
        x: points[points.length - 1].x,
        label: formatDate(points[points.length - 1].createdAt),
      });
    }
  }

  // Y-axis labels (mood values)
  const yAxisLabels = [
    { y: padding.top, label: "Calm", value: 5 },
    { y: padding.top + chartHeight * 0.5, label: "Neutral", value: 3 },
    { y: padding.top + chartHeight, label: "Reactive", value: 0 },
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-6">
      <h3 className="text-white text-center text-sm font-semibold mb-4 uppercase tracking-wide">
        Mood History ({days} Days)
      </h3>
      <div className="flex justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          {yAxisLabels.map((label) => (
            <line
              key={label.value}
              x1={padding.left}
              y1={label.y}
              x2={padding.left + chartWidth}
              y2={label.y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPathData}
            fill="url(#moodGradient)"
            opacity={0.3}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#D4AF37"
              stroke="#fff"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {yAxisLabels.map((label) => (
            <text
              key={label.value}
              x={padding.left - 10}
              y={label.y + 4}
              textAnchor="end"
              className="text-[10px] fill-white/60"
            >
              {label.label}
            </text>
          ))}

          {/* X-axis labels */}
          {xAxisLabels.map((label, index) => (
            <text
              key={index}
              x={label.x}
              y={height - padding.bottom + 15}
              textAnchor="middle"
              className="text-[10px] fill-white/60"
            >
              {label.label}
            </text>
          ))}

          {/* Y-axis line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />

          {/* X-axis line */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Object.entries(MOOD_LABELS).map(([mood, label]) => {
          const count = moodLogs.filter((log) => log.mood === mood).length;
          if (count === 0) return null;
          return (
            <div
              key={mood}
              className="flex items-center gap-1 text-xs text-white/60"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    MOOD_VALUES[mood as Mood] >= 3
                      ? "#D4AF37"
                      : MOOD_VALUES[mood as Mood] >= 2
                      ? "#888"
                      : "#666",
                }}
              />
              <span>{label}</span>
              <span className="text-white/40">({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}




