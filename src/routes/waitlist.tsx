import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { WaitlistHero } from "../components/waitlist/WaitlistHero";
import { WaitlistStatus } from "../components/waitlist/WaitlistStatus";
import { HowItWorks } from "../components/waitlist/HowItWorks";
import { WhyDifferent } from "../components/waitlist/WhyDifferent";

export const Route = createFileRoute("/waitlist")({
  component: WaitlistPage,
});

interface WaitlistStatusData {
  email: string;
  referralCode: string;
  referralCount: number;
  position: number;
  earlyAccess: boolean;
}

function WaitlistPage() {
  const search = Route.useSearch();
  const referralCode = (search as { ref?: string }).ref;

  const [waitlistStatus, setWaitlistStatus] =
    useState<WaitlistStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await joinWaitlist({
        email,
        referredByCode: referralCode,
      });

      setWaitlistStatus({
        email: result.email,
        referralCode: result.referralCode,
        referralCount: result.referralCount,
        position: result.position,
        earlyAccess: result.earlyAccess,
      });
    } catch (err) {
      // Handle network failures and other errors
      if (err instanceof Error) {
        // Check for common error patterns
        if (err.message.includes("network") || err.message.includes("fetch")) {
          setError(
            "Network error. Please check your connection and try again."
          );
        } else if (err.message.includes("timeout")) {
          setError("Request timed out. Please try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto py-8 sm:py-12 md:py-16 space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <div>
          {!waitlistStatus ? (
            <WaitlistHero
              onSubmit={handleSubmit}
              loading={isLoading}
              error={error || undefined}
            />
          ) : (
            <WaitlistStatus
              position={waitlistStatus.position}
              referralCount={waitlistStatus.referralCount}
              referralCode={waitlistStatus.referralCode}
              earlyAccess={waitlistStatus.earlyAccess}
            />
          )}
        </div>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Why Different Section */}
        <WhyDifferent />
      </div>
    </div>
  );
}
