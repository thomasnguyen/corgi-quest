import { Mic } from "lucide-react";

interface ListeningIndicatorProps {
  isListening: boolean;
}

export function ListeningIndicator({ isListening }: ListeningIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`
          w-24 h-24 rounded-full 
          ${isListening ? "bg-gray-700 animate-pulse" : "bg-gray-800"}
          flex items-center justify-center border border-gray-600
        `}
      >
        <Mic
          className={`w-12 h-12 ${isListening ? "text-gray-400" : "text-gray-500"}`}
        />
      </div>
      <p
        className={`mt-4 text-sm font-medium ${isListening ? "text-gray-300" : "text-gray-500"}`}
      >
        {isListening ? "Listening..." : "Waiting for speech"}
      </p>
    </div>
  );
}
