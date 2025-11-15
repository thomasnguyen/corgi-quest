import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface WaitlistStatusProps {
  position: number;
  referralCount: number;
  referralCode: string;
  earlyAccess: boolean;
}

export function WaitlistStatus({
  position,
  referralCount,
  referralCode,
  earlyAccess,
}: WaitlistStatusProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/waitlist?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 px-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 sm:p-8 space-y-6">
        {/* Queue Position */}
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-sm">You're in line</p>
          <p className="text-4xl sm:text-5xl font-bold text-white">
            #{position}
          </p>
        </div>

        {/* Early Access Status */}
        <div className="text-center">
          {earlyAccess ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 font-semibold text-base sm:text-lg">
                🎉 Early Access Unlocked!
              </p>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-400">
              Invite 1 friend to unlock early access
            </p>
          )}
        </div>

        {/* Referral Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Referral Progress</span>
            <span className="text-white font-semibold text-sm sm:text-base">
              {referralCount} / 1 friends joined
            </span>
          </div>
          <div className="w-full bg-[#2a2a2a] rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(referralCount * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-3">
          <p className="text-gray-400 text-sm font-semibold">
            Your Referral Link
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 sm:px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-gray-300 text-xs sm:text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Instructions */}
        <div className="text-center text-xs sm:text-sm text-gray-500 space-y-1">
          <p>Share this link with a friend.</p>
          <p>When they join, you both get early access!</p>
        </div>
      </div>
    </div>
  );
}
