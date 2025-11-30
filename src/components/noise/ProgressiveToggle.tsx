// Progressive Exposure Toggle Component
// Allows users to enable/disable automatic volume progression during training

interface ProgressiveToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function ProgressiveToggle({
  enabled,
  onToggle,
}: ProgressiveToggleProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="progressive-toggle"
          className="text-white font-medium cursor-pointer"
        >
          Progressive exposure
        </label>
        <button
          id="progressive-toggle"
          role="switch"
          aria-checked={enabled}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 ${
            enabled ? "bg-green-600" : "bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <p className="text-sm text-gray-400">
        Automatically increases volume by 10% every 60 seconds, starting at 10%
        and capping at 60%. Helps gradually desensitize your dog to trigger
        sounds.
      </p>
    </div>
  );
}
