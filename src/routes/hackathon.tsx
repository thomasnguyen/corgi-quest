import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { HeroSection } from "../components/hackathon/HeroSection";
import { DemoVideoSection } from "../components/hackathon/DemoVideoSection";
import { CoreValuesSection } from "../components/hackathon/CoreValuesSection";
import { HowItWorksSection } from "../components/hackathon/HowItWorksSection";
import { TechStackSection } from "../components/hackathon/TechStackSection";
import { RealDataSection } from "../components/hackathon/RealDataSection";
import { TestingInstructions } from "../components/hackathon/TestingInstructions";
import { FeatureGrid } from "../components/hackathon/FeatureGrid";
import { VisionProSection } from "../components/hackathon/VisionProSection";
import { FinalCTA } from "../components/hackathon/FinalCTA";

export const Route = createFileRoute("/hackathon")({
  component: HackathonLandingPage,
});

function HackathonLandingPage() {
  const videoSectionRef = useRef<HTMLDivElement>(null);

  const handleWatchDemo = () => {
    videoSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      {/* Flame background at bottom with gradient fade */}
      <div
        className="fixed bottom-0 left-0 right-0 h-[300px] pointer-events-none z-0"
        style={{
          backgroundImage: "url(/images/flame_web_bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
          opacity: 0.6,
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.7) 50%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.7) 50%, black 100%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16 space-y-12 sm:space-y-16 relative z-10">
        <HeroSection onWatchDemo={handleWatchDemo} />

        {/* Demo Video Section */}
        <div ref={videoSectionRef}>
          <DemoVideoSection
            videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            caption="Watch how Corgi Quest transforms real-world dog training into an engaging RPG experience with voice logging, real-time sync between partners, and AI-powered coaching."
          />
        </div>

        {/* Core Values Section */}
        <CoreValuesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Tech Stack Section */}
        <TechStackSection />

        {/* Real Data Section */}
        <RealDataSection />

        {/* Feature Grid */}
        <FeatureGrid />

        {/* Vision Pro Section */}
        <VisionProSection />

        {/* Testing Instructions with manual credentials fallback */}
        <TestingInstructions />

        {/* Final CTA */}
        <FinalCTA />
      </div>
    </div>
  );
}
