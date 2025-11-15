interface StopButtonProps {
  onClick: () => void;
}

export function StopButton({ onClick }: StopButtonProps) {
  return (
    <div className="px-6 py-4">
      <button
        onClick={onClick}
        className="w-full max-w-md mx-auto block py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 hover:text-white font-medium text-xs transition-colors border border-gray-700 hover:border-gray-600"
      >
        Exit
      </button>
    </div>
  );
}
