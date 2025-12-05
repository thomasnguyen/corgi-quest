import { useDemoLogin } from "../../hooks/useDemoLogin";

export function FinalCTA() {
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

  const handleViewGitHub = () => {
    window.open(
      "https://github.com/thomasnguyen/corgi-quest",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="flex flex-col items-center text-center space-y-8 py-12 sm:py-16 border-t-2 border-[#f5c35f]/20">
      {/* Headline */}
      <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
        Ready to experience Corgi Quest?
      </h2>

      {/* Subheadline */}
      <p className="text-lg text-[#f9dca0] max-w-2xl">
        Try the live demo with real training data, or explore the source code to
        see how we built it.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {/* Primary CTA - Launch Demo */}
        <button
          onClick={handleLaunchDemo}
          disabled={isLoading}
          className="px-10 py-5 bg-[#f5c35f] text-black font-bold rounded-lg hover:bg-[#fcd587] transition-all duration-200 text-xl min-h-[44px] min-w-[44px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          {isLoading ? "Loading..." : "Launch Demo"}
        </button>

        {/* Secondary CTA - View GitHub */}
        <button
          onClick={handleViewGitHub}
          className="px-10 py-5 border-2 border-[#f5c35f] text-[#f5c35f] font-bold rounded-lg hover:bg-[#f5c35f]/10 transition-all duration-200 text-xl min-h-[44px] min-w-[44px] shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          View GitHub →
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm max-w-md">
          <p className="font-semibold mb-1">Auto-login failed</p>
          <p>{error}</p>
          <p className="mt-2 text-xs">
            Please scroll up to the Testing Instructions section for backup
            credentials.
          </p>
        </div>
      )}

      {/* Additional context */}
      <div className="mt-8 text-[#f9dca0]/70 text-sm space-y-2">
        <p>Built for Kiroween 2025 🎃</p>
        <p className="text-xs">
          Real-time dog training RPG • Powered by Convex, OpenAI, and Kiro
        </p>
      </div>
    </section>
  );
}
