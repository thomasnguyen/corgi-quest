/**
 * Testing Instructions Component
 * Displays auto-login button and testing steps for judges
 */

import { useDemoLogin } from "../../hooks/useDemoLogin";

export function TestingInstructions() {
  const { attemptDemoLogin, isLoading } = useDemoLogin();

  const handleAutoLogin = async () => {
    await attemptDemoLogin();
  };

  return (
    <section id="testing-instructions" className="space-y-6">
      <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
        Testing Instructions
      </h2>

      <div className="bg-[#121216] border border-[#f5c35f]/20 p-6 rounded-lg space-y-6">
        {/* Auto-Login CTA */}
        <div className="space-y-3">
          <h3 className="text-[#feefd0] text-xl font-bold">
            Launch Demo (Auto-Login)
          </h3>
          <p className="text-[#f9dca0] text-sm">
            Click the button below to automatically start exploring the app with
            pre-loaded demo data:
          </p>
          <button
            onClick={handleAutoLogin}
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-4 bg-[#f5c35f] text-black font-semibold rounded-lg hover:bg-[#fcd587] transition-colors duration-200 text-lg min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : "Launch Demo Now"}
          </button>
        </div>

        {/* Testing Steps */}
        <div className="space-y-3 pt-4 border-t border-[#f5c35f]/10">
          <h3 className="text-[#feefd0] text-xl font-bold">What to Test</h3>
          <ol className="text-[#f9dca0] space-y-2 list-decimal list-inside">
            <li>
              <span className="font-semibold">Voice Logging:</span> Try saying
              "We practiced sit for 5 minutes" in Training Mode
            </li>
            <li>
              <span className="font-semibold">Real-Time Sync:</span> Open the
              app on two devices to see instant updates
            </li>
            <li>
              <span className="font-semibold">Cosmetics:</span> Check out
              AI-generated dog transformations in the Items tab
            </li>
            <li>
              <span className="font-semibold">Stats & Goals:</span> View
              PHY/INT/IMP/SOC progression and daily goals
            </li>
            <li>
              <span className="font-semibold">Activity Feed:</span> See
              real-time activity logs from both partners
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
