import { Mic } from "lucide-react";

interface ListeningIndicatorProps {
  isListening: boolean;
}

export function ListeningIndicator({ isListening }: ListeningIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Animated container with pulsing rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing rings - only show when listening */}
        {isListening && (
          <>
            <div className="absolute w-32 h-32 rounded-full bg-[#f5c35f]/10 animate-ping" />
            <div
              className="absolute w-28 h-28 rounded-full bg-[#f5c35f]/20 animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="absolute w-24 h-24 rounded-full bg-[#f5c35f]/30 animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </>
        )}

        {/* Main microphone circle */}
        <div
          className={`
            relative w-24 h-24 rounded-full 
            ${isListening ? "bg-[#f5c35f]/20 shadow-lg shadow-[#f5c35f]/30" : "bg-gray-800"}
            flex items-center justify-center border-2 
            ${isListening ? "border-[#f5c35f]/50" : "border-gray-600"}
            transition-all duration-300
          `}
        >
          <Mic
            className={`w-12 h-12 transition-colors duration-300 ${
              isListening ? "text-[#f5c35f]" : "text-gray-500"
            }`}
          />
        </div>
      </div>

      {/* Sound wave bars animation */}
      {isListening && (
        <div className="flex items-end justify-center gap-1 mt-4 h-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-[#f5c35f] rounded-full animate-soundwave"
              style={{
                animationDelay: `${i * 100}ms`,
                height: "100%",
              }}
            />
          ))}
        </div>
      )}

      {/* Status text with animated dots */}
      <p
        className={`mt-4 text-sm font-medium ${
          isListening ? "text-[#f9dca0]" : "text-gray-500"
        }`}
      >
        {isListening ? (
          <span className="flex items-center gap-1">
            Listening
            <span className="flex gap-0.5">
              <span
                className="animate-bounce"
                style={{ animationDelay: "0ms" }}
              >
                .
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "150ms" }}
              >
                .
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "300ms" }}
              >
                .
              </span>
            </span>
          </span>
        ) : (
          "Waiting for speech"
        )}
      </p>
    </div>
  );
}
