interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
}

/**
 * Linear progress bar component
 * Displays horizontal bar with gold gradient on dark background
 * Shows numeric values below bar
 * Requirements: 2, 4, 13, 20
 */
export function ProgressBar({ current, max, label }: ProgressBarProps) {
  // Calculate percentage, clamped between 0 and 100
  const percentage = Math.min(Math.max((current / max) * 100, 0), 100);

  return (
    <div className="w-full">
      {label && (
        <div className="text-sm font-medium text-[#f5c35f] mb-2">{label}</div>
      )}

      {/* Progress bar container */}
      <div className="w-full h-1 bg-[#0c0b0b]/80 border border-white/20 rounded-sm overflow-hidden">
        {/* Progress bar fill - gold gradient */}
        <div
          className="h-full bg-gradient-to-r from-[#c6a755] to-[#fff1ab] transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Numeric values */}
      <div className="mt-2 text-sm text-white text-center">
        {current} / {max}
      </div>
    </div>
  );
}
