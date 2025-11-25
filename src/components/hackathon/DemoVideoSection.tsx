import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

interface DemoVideoSectionProps {
  videoUrl: string;
  caption?: string;
}

export function DemoVideoSection({
  videoUrl,
  caption = "Watch how Corgi Quest transforms real-world dog training into an engaging RPG experience with voice logging, real-time sync, and AI-powered coaching.",
}: DemoVideoSectionProps) {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract video ID from YouTube URL
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  const handleLaunchDemo = () => {
    navigate({ to: "/" });
  };

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
          Watch the Demo
        </h2>
        <p className="text-[#f9dca0] text-sm sm:text-base max-w-2xl mx-auto">
          See Corgi Quest in action before trying it yourself
        </p>
      </div>

      {/* Video Container with Aspect Ratio */}
      <div className="relative w-full rounded-lg overflow-hidden bg-[#121216] border border-[#f5c35f]/20">
        <div className="relative pb-[56.25%]">
          {" "}
          {/* 16:9 aspect ratio */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
              <div className="text-[#f9dca0] text-sm">Loading video...</div>
            </div>
          )}
          <iframe
            src={embedUrl}
            title="Corgi Quest Demo Video"
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>

      {/* Caption */}
      <div className="text-center space-y-4">
        <p className="text-[#f9dca0] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          {caption}
        </p>
        <p className="text-[#fcd587] text-xs sm:text-sm italic">
          Key features to notice: Voice logging, real-time XP updates,
          multi-stat progression, and AI-powered coaching
        </p>
      </div>

      {/* CTA after video */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleLaunchDemo}
          className="px-8 py-4 bg-[#f5c35f] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#fcd587] transition-colors duration-200 shadow-lg hover:shadow-xl min-h-[44px] min-w-[44px]"
        >
          Launch Demo Now
        </button>
      </div>
    </section>
  );
}
