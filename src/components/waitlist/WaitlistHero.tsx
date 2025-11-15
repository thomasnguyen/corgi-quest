import { useState } from "react";

interface WaitlistHeroProps {
  onSubmit: (email: string) => Promise<void>;
  loading: boolean;
  error?: string;
}

export function WaitlistHero({ onSubmit, loading, error }: WaitlistHeroProps) {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Client-side email validation
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setValidationError("Please enter an email address");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    await onSubmit(trimmedEmail);
  };

  return (
    <div className="text-center space-y-6 px-4">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          Turn dog training into a daily quest
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
          Corgi Quest is a real-time training companion that turns walks,
          practice, and play into XP, streaks, and shared progress for your
          household.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 px-4">
        <div className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            required
            autoComplete="email"
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Joining..." : "Join Waitlist"}
          </button>
        </div>

        {(validationError || error) && (
          <p className="text-red-400 text-sm">{validationError || error}</p>
        )}
      </form>

      <div className="space-y-2 text-sm text-gray-500 px-4">
        <p>
          Built by dog parents preparing their corgi for a baby. Free to join.
        </p>
        <p>Private beta starting January 2026</p>
      </div>
    </div>
  );
}
