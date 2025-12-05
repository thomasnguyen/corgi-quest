import { Heart } from "lucide-react";

export function RealDataSection() {
  // Placeholder screenshots - replace with actual training log screenshots
  const screenshots = [
    {
      src: "/bumi_regular.png", // Placeholder - replace with actual training log screenshot
      alt: "Bumi training activity log showing XP gains and stat progression",
      caption: "Real training sessions logged during walks",
    },
    {
      src: "/stat_bg.png", // Placeholder - replace with actual stats screenshot
      alt: "Bumi's stat progression showing PHY, INT, IMP, and SOC growth",
      caption: "Multi-stat progression from consistent training",
    },
  ];

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
          Real Training Data from Bumi
        </h2>
        <p className="text-[#f9dca0] text-lg max-w-2xl mx-auto">
          Every activity, every XP gain, every level-up — this is our actual
          journey training our reactive corgi
        </p>
      </div>

      {/* Emotional Note */}
      <div className="bg-[#121216] border border-[#f5c35f]/30 rounded-lg p-6 sm:p-8 max-w-3xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="text-[#f5c35f] flex-shrink-0 mt-1">
            <Heart size={24} fill="currentColor" />
          </div>
          <div className="space-y-3">
            <p className="text-[#feefd0] text-lg font-semibold">
              Why We Built This
            </p>
            <p className="text-[#f9dca0] leading-relaxed">
              Every screenshot is real. Every XP gain is from an actual training
              session with Bumi. We use this daily to prepare for a baby, and
              the real-time sync keeps us aligned when life gets chaotic. We
              built this for us—but if it works for us, maybe it works for
              others.
            </p>
          </div>
        </div>
      </div>

      {/* Character Selection & App Screenshots */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        <div className="flex flex-col items-center">
          <img
            src="/choose-character.png"
            alt="Character selection screen showing different dog breeds to choose from"
            loading="lazy"
            className="w-full max-w-xs object-contain"
          />
          <p className="text-[#f9dca0] text-sm text-center mt-4">
            Choose your companion to start your training journey
          </p>
        </div>
        <div className="flex flex-col items-center">
          <img
            src="/screenshot1.png"
            alt="App screenshot showing training interface and stats"
            loading="lazy"
            className="w-full max-w-xs object-contain"
          />
          <p className="text-[#f9dca0] text-sm text-center mt-4">
            Track your training progress in real-time
          </p>
        </div>
      </div>

      {/* Additional Context */}
      <div className="text-center">
        <p className="text-[#f9dca0]/70 text-sm max-w-2xl mx-auto">
          These screenshots show actual training sessions from the past week.
          Every activity is logged in real-time, parsed by OpenAI, and synced
          instantly between our devices via Convex.
        </p>
      </div>
    </section>
  );
}
