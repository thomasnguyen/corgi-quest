interface SessionControlsProps {
  onStopAll: () => void;
  onResetTimer: () => void;
}

export function SessionControls({
  onStopAll,
  onResetTimer,
}: SessionControlsProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="max-w-md mx-auto flex gap-3">
        <button
          onClick={onStopAll}
          className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors min-h-[44px]"
          aria-label="Stop all sounds"
        >
          Stop All
        </button>
        <button
          onClick={onResetTimer}
          className="flex-1 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors min-h-[44px]"
          aria-label="Reset session timer"
        >
          Reset Timer
        </button>
      </div>
    </div>
  );
}
