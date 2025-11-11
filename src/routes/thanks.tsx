import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/thanks")({
  component: ThanksPage,
});

/**
 * Thanks page with tip jar integration
 * Displays after completing quests or reaching milestones
 * Requirements: 35
 */
function ThanksPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createCheckout = useAction(api.actions.createAutumnCheckout);

  /**
   * Handle tip checkout
   * In sandbox mode, this simulates the Autumn checkout flow
   * In production, this would redirect to Autumn's checkout page
   */
  const handleTipCheckout = async (amount: number) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get customer ID from localStorage (selected character)
      const customerId =
        localStorage.getItem("selectedCharacterId") || "guest_user";

      // Create checkout session via Convex action
      const result = await createCheckout({
        amount,
        customerId,
        successUrl: `${window.location.origin}/thanks?success=true`,
      });

      // In sandbox mode, result.url will be null
      // In production, redirect to Autumn checkout page
      if (result.url) {
        window.location.href = result.url;
        return;
      }

      // Sandbox mode - show success immediately
      if (result.mode === "sandbox") {
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Show success message
        setSuccess(true);
        setIsProcessing(false);

        // Store tip in localStorage for demo tracking
        const tips = JSON.parse(localStorage.getItem("corgiQuestTips") || "[]");
        tips.push({
          amount,
          sessionId: result.sessionId,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("corgiQuestTips", JSON.stringify(tips));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process tip. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const handleCustomAmount = () => {
    const amount = prompt("Enter custom tip amount (USD):");
    if (amount) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Please enter a valid amount");
        return;
      }
      handleTipCheckout(parsedAmount);
    }
  };
  return (
    <>
      <div className="min-h-screen bg-[url('/smoke_spark_bg.svg')] bg-no-repeat bg-bottom bg-contain py-8 px-6 absolute top-0 left-0 right-0 z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent mb-2">
              Thanks for Playing
            </h1>
            <h2 className="text-2xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
              Corgi Quest!
            </h2>
          </div>

          {/* Bumi Image/Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Using the summon.png image as Bumi representation */}
              <picture>
                <source srcSet="/summon.webp" type="image/webp" />
                <img
                  src="/summon.png"
                  alt="Bumi"
                  loading="lazy"
                  className="w-48 h-48 object-contain"
                />
              </picture>
            </div>
          </div>

          {/* Tip Section */}
          <div className="bg-[#1a1a1e] border-2 border-[#D4AF37] rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-[#D4AF37] text-center mb-4">
              Tip Corgi Quest Pro
            </h3>

            {success ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-[#D4AF37] text-xl font-bold mb-2">
                  Thank You!
                </p>
                <p className="text-[#feefd0] text-sm">
                  Your support helps keep Corgi Quest running and improving!
                </p>
              </div>
            ) : (
              <>
                <p
                  className="text-[#feefd0] text-sm text-center mb-6"
                  style={{ textShadow: "0px 1px 1px #1e1e1e" }}
                >
                  Enjoying Corgi Quest? Support development and unlock exclusive
                  features!
                </p>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                {/* Tip Amount Options */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button
                    className="bg-[#2a2a2e] hover:bg-[#3a3a3e] border border-[#D4AF37] text-[#D4AF37] font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleTipCheckout(3)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "..." : "$3"}
                  </button>
                  <button
                    className="bg-[#2a2a2e] hover:bg-[#3a3a3e] border border-[#D4AF37] text-[#D4AF37] font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleTipCheckout(5)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "..." : "$5"}
                  </button>
                  <button
                    className="bg-[#2a2a2e] hover:bg-[#3a3a3e] border border-[#D4AF37] text-[#D4AF37] font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleTipCheckout(10)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "..." : "$10"}
                  </button>
                </div>

                {/* Custom Amount Button */}
                <button
                  className="w-full bg-[#D4AF37] hover:bg-[#c49f2f] text-[#121216] font-bold py-3 px-6 rounded-lg transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCustomAmount}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Custom Amount"}
                </button>

                {/* Sandbox Mode Notice */}
                <div className="bg-yellow-900/20 border border-yellow-600 text-yellow-200 px-3 py-2 rounded text-xs text-center mb-4">
                  🧪 Sandbox Mode - No real charges will be made
                </div>

                {/* Powered by Autumn */}
                <p className="text-[#888] text-xs text-center">
                  Powered by{" "}
                  <a
                    href="https://www.getautumn.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D4AF37] hover:underline"
                  >
                    Autumn
                  </a>
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-[#2a2a2e] hover:bg-[#3a3a3e] border border-[#D4AF37] text-[#D4AF37] font-semibold py-3 px-6 rounded-lg text-center transition-colors"
            >
              Back to Overview
            </Link>

            <button
              className="w-full bg-transparent text-[#888] text-sm py-2 hover:text-[#aaa] transition-colors"
              onClick={() => {
                // Store dismissal in localStorage
                localStorage.setItem(
                  "thanksDismissed",
                  new Date().toISOString()
                );
                window.history.back();
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      {/* Dark background under the content */}
      <div className="bg-[#121216] h-screen w-full absolute bottom-0 left-0 right-0 z-0"></div>
    </>
  );
}
