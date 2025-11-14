interface OverallXpChartProps {
  data: Array<{ date: string; xp: number }>;
}

export default function OverallXpChart({ data }: OverallXpChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
        <h3 className="text-white text-center text-sm font-semibold mb-3 uppercase tracking-wide">
          Overall XP Progress
        </h3>
        <div className="flex items-center justify-center h-32">
          <p className="text-white/60 text-xs">No data available</p>
        </div>
      </div>
    );
  }

  const width = 280;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxXp = Math.max(...data.map((d) => d.xp), 1);
  const minXp = Math.min(...data.map((d) => d.xp), 0);

  // Generate points for line
  const points = data.map((d, index) => {
    const divisor = data.length > 1 ? data.length - 1 : 1;
    const x = padding.left + (index / divisor) * chartWidth;
    const xpRange = maxXp - minXp || 1;
    const y =
      padding.top +
      chartHeight -
      ((d.xp - minXp) / xpRange) * chartHeight;
    return { x, y, xp: d.xp, date: d.date };
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

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4">
      <h3 className="text-white text-center text-sm font-semibold mb-3 uppercase tracking-wide">
        Overall XP Progress
      </h3>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight - ratio * chartHeight;
          const value = Math.round(minXp + ratio * (maxXp - minXp));
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="#3d3d3d"
                strokeWidth="1"
                opacity={0.3}
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="#888"
                fontSize="10"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path
          d={areaPathData}
          fill="#D4AF37"
          fillOpacity={0.2}
        />

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
            r="3"
            fill="#D4AF37"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
        ))}

        {/* X-axis labels (show first, middle, last) */}
        {data.length > 0 && (
          <>
            <text
              x={points[0].x}
              y={height - 10}
              textAnchor="middle"
              fill="#888"
              fontSize="9"
            >
              {formatDate(data[0].date)}
            </text>
            {data.length > 1 && (
              <text
                x={points[Math.floor(points.length / 2)].x}
                y={height - 10}
                textAnchor="middle"
                fill="#888"
                fontSize="9"
              >
                {formatDate(data[Math.floor(data.length / 2)].date)}
              </text>
            )}
            {data.length > 2 && (
              <text
                x={points[points.length - 1].x}
                y={height - 10}
                textAnchor="middle"
                fill="#888"
                fontSize="9"
              >
                {formatDate(data[data.length - 1].date)}
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}


