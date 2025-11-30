import { Link } from "@tanstack/react-router";

export function NoiseCTA() {
  return (
    <div className="mt-8 mb-6 text-center">
      {/* Powered by text */}
      <p className="text-sm text-gray-500 mb-3">powered by Corgi Quest</p>

      {/* CTA Button */}
      <Link
        to="/waitlist"
        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
      >
        Get daily training quests in the Corgi Quest app →
      </Link>

      {/* Optional subtitle */}
      <p className="text-xs text-gray-400 mt-3 max-w-sm mx-auto">
        Turn real-world dog training into an RPG adventure with your partner
      </p>
    </div>
  );
}
