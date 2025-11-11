import { DogStat, StatType } from "../../lib/types";

interface RadarChartProps {
  stats: DogStat[];
  size?: number;
}

const STAT_LABELS: Record<StatType, string> = {
  INT: "INT",
  PHY: "PHY",
  IMP: "IMP",
  SOC: "SOC",
};

// Order of stats for the radar chart (clockwise from top)
const STAT_ORDER: StatType[] = ["INT", "PHY", "SOC", "IMP"];

export default function RadarChart({ stats, size = 200 }: RadarChartProps) {
  const center = size / 2;
  const maxRadius = size * 0.35; // Leave room for labels
  const levels = 5; // Number of concentric polygons (grid lines)

  // Calculate points for a square (4 stats)
  const getPoint = (
    index: number,
    value: number,
    maxValue: number
  ): { x: number; y: number } => {
    // Create a square shape with 4 points
    const angle = (index * Math.PI * 2) / 4 - Math.PI / 2; // Start from top
    const radius = (value / maxValue) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Get label position (further out than max radius)
  const getLabelPoint = (index: number): { x: number; y: number } => {
    const angle = (index * Math.PI * 2) / 4 - Math.PI / 2;
    const labelRadius = maxRadius + 20;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    };
  };

  // Find max level for scaling
  const maxLevel = Math.max(...stats.map((s) => s.level), 10);

  // Create ordered stat data
  const orderedStats = STAT_ORDER.map((statType) => {
    const stat = stats.find((s) => s.statType === statType);
    return {
      statType,
      level: stat?.level || 0,
      label: STAT_LABELS[statType],
    };
  });

  // Generate grid lines (concentric squares)
  const gridLines = Array.from({ length: levels }, (_, i) => {
    const levelValue = ((i + 1) / levels) * maxLevel;
    const points = Array.from({ length: 4 }, (_, j) => {
      return getPoint(j, levelValue, maxLevel);
    });
    return { points, level: Math.round(levelValue) };
  });

  // Generate data polygon points
  const dataPoints = orderedStats.map((stat, index) => {
    return getPoint(index, stat.level, maxLevel);
  });

  // Convert points to SVG path
  const pointsToPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return "";
    const pathData = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
    return `${pathData} Z`;
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Grid lines (concentric squares) */}
        {gridLines.map((grid, i) => (
          <path
            key={`grid-${i}`}
            d={pointsToPath(grid.points)}
            fill="none"
            stroke="#3d3d3d"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}

        {/* Axis lines from center to each corner */}
        {orderedStats.map((_, index) => {
          const endPoint = getPoint(index, maxLevel, maxLevel);
          return (
            <line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="#3d3d3d"
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}

        {/* Data polygon (filled area) */}
        <path
          d={pointsToPath(dataPoints)}
          fill="#D4AF37"
          fillOpacity={0.2}
          stroke="#D4AF37"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Data points (circles at each vertex) */}
        {dataPoints.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#D4AF37"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
        ))}

        {/* Labels */}
        {orderedStats.map((stat, index) => {
          const labelPos = getLabelPoint(index);
          return (
            <g key={`label-${index}`}>
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold fill-[#D4AF37]"
              >
                {stat.label}
              </text>
              <text
                x={labelPos.x}
                y={labelPos.y + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] fill-[#f5c35f]"
              >
                LVL {stat.level}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
