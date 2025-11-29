import { useDemoLogin } from "../../hooks/useDemoLogin";

interface HeroSectionProps {
  onWatchDemo?: () => void;
}

export function HeroSection({ onWatchDemo }: HeroSectionProps) {
  const { attemptDemoLogin, isLoading, error } = useDemoLogin();

  const handleLaunchDemo = async () => {
    const result = await attemptDemoLogin();

    if (!result.success) {
      // If auto-login fails, scroll to testing instructions section
      const testingSection = document.getElementById("testing-instructions");
      if (testingSection) {
        testingSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="flex flex-col items-center text-center space-y-8">
      {/* Corgi Quest Logo */}
      <div className="w-130 relative -mt-10 -mb-2">
        <img
          src="/corgiquestlogo.png"
          alt="Corgi Quest Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Headline with golden gradient */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent leading-tight">
        We couldn't stay aligned training our{" "}
        <span className="relative inline-block">
          <span className="relative z-10 bg-gradient-to-b from-amber-400 to-amber-600 bg-clip-text text-transparent">
            reactive
          </span>
          <span className="absolute inset-0 bg-amber-700 blur-lg opacity-30" />
        </span>{" "}
        dog
      </h1>

      {/* Subheadline with cream text */}
      <p className="text-lg sm:text-xl md:text-2xl text-[#f9dca0] max-w-3xl">
        A real-time co-op dog-training RPG for couples
      </p>

      {/* Micro-story */}
      <p className="text-base sm:text-lg text-[#f9dca0]/80 max-w-2xl italic">
        Bumi's reactivity stressed us out. We needed consistency and teamwork
        before our human baby arrives.
      </p>

      {/* 15-second skim bullets */}
      <div className="w-full max-w-2xl text-left space-y-3 pt-4">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🔄</span>
          <p className="text-[#feefd0] text-sm sm:text-base">
            <strong>Instant couples sync</strong> — Syncs both partners in real
            time
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🎙️</span>
          <p className="text-[#feefd0] text-sm sm:text-base">
            <strong>Hands-free voice logging</strong> — Claude turns "5 calm
            reps" into XP as you train
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🥽</span>
          <p className="text-[#feefd0] text-sm sm:text-base">
            <strong>Vision Pro HUD</strong> — Stats and goals float around you
            in live sessions
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🛠️</span>
          <p className="text-[#feefd0] text-sm sm:text-base">
            <strong>Kiro-powered</strong> — Specs, hooks, and steering wire the
            whole system together
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {/* Primary CTA - Launch Demo */}
        <button
          onClick={handleLaunchDemo}
          disabled={isLoading}
          className="px-8 py-4 bg-[#f5c35f] text-black font-semibold rounded-lg hover:bg-[#fcd587] transition-colors duration-200 text-lg min-h-[44px] min-w-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Loading..." : "Launch Demo (Auto-Login)"}
        </button>

        {/* Secondary CTA - Watch Demo */}
        <button
          onClick={onWatchDemo}
          className="px-8 py-4 border-2 border-[#f5c35f] text-[#f5c35f] font-semibold rounded-lg hover:bg-[#f5c35f]/10 transition-colors duration-200 text-lg min-h-[44px] min-w-[44px]"
        >
          Watch Demo
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm max-w-md">
          <p className="font-semibold mb-1">Auto-login failed</p>
          <p>{error}</p>
          <p className="mt-2 text-xs">
            Please scroll down to the Testing Instructions section or manually
            select a character.
          </p>
        </div>
      )}

      {/* Hero Visual - Mobile App Screenshot */}
      <div className="w-full max-w-sm mt-8 mx-auto">
        <div className="relative rounded-3xl overflow-hidden border-2 border-[#f5c35f]/30 bg-[#121216] shadow-2xl">
          {/* Mobile phone frame aspect ratio (9:19.5 typical for modern phones) */}
          <div className="aspect-[9/19.5] flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#121216]">
            {/* Placeholder for mobile app screenshot */}
            <div className="text-[#f9dca0]/50 text-center p-8">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-[#f5c35f]/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm">Mobile App Screenshot</p>
              <p className="text-xs mt-2 opacity-70">
                Training interface, stats, and real-time sync
              </p>
            </div>
          </div>

          {/* Optional: Add a subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#f5c35f]/5 to-transparent pointer-events-none" />
        </div>

        {/* Caption below phone */}
        <p className="text-center text-[#f9dca0]/70 text-sm mt-4">
          Mobile-first PWA • Works on iOS & Android
        </p>
      </div>
    </section>
  );
}
