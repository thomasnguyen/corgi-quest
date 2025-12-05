import { Glasses } from "lucide-react";

export function VisionProSection() {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Glasses className="text-[#f5c35f]" size={32} />
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
            Vision Pro Training HUD
          </h2>
        </div>
        <p className="text-[#f9dca0] text-lg max-w-2xl mx-auto">
          Real-time stats and goals floating in your space during actual
          training sessions
        </p>
      </div>

      {/* HUD Screenshot */}
      <div className="bg-[#121216] border border-[#f5c35f]/20 rounded-lg overflow-hidden hover:border-[#f5c35f]/40 transition-colors max-w-4xl mx-auto">
        {/* Image Container with Lazy Loading */}
        <div className="relative aspect-video bg-gradient-to-b from-[#0a0a0a] to-[#121216]">
          <img
            src="/vr_screenshot.png"
            alt="Vision Pro HUD showing real-time training stats, daily goals, and activity feed during a live training session"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay for better visual depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/40 to-transparent pointer-events-none" />
        </div>

        {/* Caption */}
        <div className="p-6 sm:p-8 bg-[#0a0a0a]/50">
          <p className="text-[#f9dca0] text-center leading-relaxed">
            Live training data synced from Convex appears instantly in visionOS.
            Check stats, track goals, and log activities hands-free while
            working with your dog.
          </p>
        </div>
      </div>

      {/* Technical Details */}
      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="bg-[#121216] border border-[#f5c35f]/10 rounded-lg p-4 text-center">
          <p className="text-[#f5c35f] font-semibold mb-1">Real-Time Sync</p>
          <p className="text-[#f9dca0] text-sm">
            Sub-second updates via Convex subscriptions
          </p>
        </div>
        <div className="bg-[#121216] border border-[#f5c35f]/10 rounded-lg p-4 text-center">
          <p className="text-[#f5c35f] font-semibold mb-1">Hands-Free</p>
          <p className="text-[#f9dca0] text-sm">
            Voice commands for logging during training
          </p>
        </div>
        <div className="bg-[#121216] border border-[#f5c35f]/10 rounded-lg p-4 text-center">
          <p className="text-[#f5c35f] font-semibold mb-1">SwiftUI + Convex</p>
          <p className="text-[#f9dca0] text-sm">
            Native visionOS app with shared backend
          </p>
        </div>
      </div>
    </section>
  );
}
