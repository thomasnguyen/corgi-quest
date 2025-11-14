interface DailyActivityCountChartProps {
  data: Array<{ date: string; count: number }>;
}

export default function DailyActivityCountChart({
  data,
}: DailyActivityCountChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
        <h3 className="text-white text-center text-sm font-semibold mb-3 uppercase tracking-wide">
          Daily Activities (30 Days)
        </h3>
        <div className="flex items-center justify-center h-32">
          <p className="text-white/60 text-xs">No data available</p>
        </div>
      </div>
    );
  }

  const width = 280;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barWidth = chartWidth / data.length;
  const barSpacing = 2;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4">
      <h3 className="text-white text-center text-sm font-semibold mb-3 uppercase tracking-wide">
        Daily Activities (30 Days)
      </h3>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight - ratio * chartHeight;
          const value = Math.round(ratio * maxCount);
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

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.count / maxCount) * chartHeight;
          const x = padding.left + index * barWidth + barSpacing / 2;
          const y = padding.top + chartHeight - barHeight;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth - barSpacing}
                height={barHeight}
                fill="#D4AF37"
                rx="2"
              />
              {/* Count label on top of bar if there's space */}
              {barHeight > 15 && (
                <text
                  x={x + (barWidth - barSpacing) / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fill="#f5c35f"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {item.count}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels (show first, middle, last) */}
        {data.length > 0 && (
          <>
            <text
              x={padding.left + 0 * barWidth + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              fill="#888"
              fontSize="9"
            >
              {formatDate(data[0].date)}
            </text>
            {data.length > 1 && (
              <text
                x={padding.left + Math.floor(data.length / 2) * barWidth + barWidth / 2}
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
                x={padding.left + (data.length - 1) * barWidth + barWidth / 2}
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



