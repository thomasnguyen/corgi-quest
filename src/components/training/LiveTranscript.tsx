import { useEffect, useRef } from "react";

interface LiveTranscriptProps {
  transcript: string;
}

export function LiveTranscript({ transcript }: LiveTranscriptProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when transcript updates
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="px-6 py-4">
      <h3 className="text-[#f5c35f] text-sm font-semibold mb-2">
        Live Transcript
      </h3>
      <div
        ref={transcriptRef}
        className="bg-[#1a1a1e] rounded-lg p-4 h-32 overflow-y-auto text-[#f9dca0] text-sm"
      >
        {transcript || 'Say "Hey Bumi" to log an activity...'}
      </div>
    </div>
  );
}
