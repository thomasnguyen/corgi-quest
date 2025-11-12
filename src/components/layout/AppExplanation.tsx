import { useState } from "react";

/**
 * Floating explanation component for desktop/wide screens
 * Shows tabs with app information
 */
export default function AppExplanation() {
  const [activeTab, setActiveTab] = useState<"about" | "features" | "stats">(
    "about"
  );

  return (
    <div className="hidden lg:block absolute left-8 top-8 w-96 max-w-sm p-6 bg-[#121216] border border-white/20 text-white rounded-lg text-base z-50 max-h-[80vh] overflow-y-auto">
      <h3 className="font-bold mb-4 text-xl">Corgi Quest</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab("about")}
          className={`pb-2 px-2 text-sm font-medium transition-colors ${
            activeTab === "about"
              ? "text-white border-b-2 border-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`pb-2 px-2 text-sm font-medium transition-colors ${
            activeTab === "features"
              ? "text-white border-b-2 border-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Features
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-2 px-2 text-sm font-medium transition-colors ${
            activeTab === "stats"
              ? "text-white border-b-2 border-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Stats
        </button>
      </div>

      {/* Tab Content */}
      <div className="text-sm text-gray-300 space-y-3">
        {activeTab === "about" && (
          <div className="space-y-3">
            <p>
              A real-time multiplayer dog training RPG where couples train
              together through shared quests, XP progression, and instant
              synchronization.
            </p>
            <p className="text-gray-400 italic">
              "Level up your dog, level up your relationship."
            </p>
            <p>
              Turn daily training into a game to stay consistent. Train together
              as a couple to stay accountable and ensure your dog is ready for
              future family life.
            </p>
            <p className="text-xs text-gray-500 pt-2">
              📱 Designed for mobile - best experience on your phone for
              on-the-go logging and voice commands.
            </p>
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-1">
                ⚡ Real-time Sync
              </h4>
              <p className="text-xs text-gray-400">
                See your partner's activities the moment they log them. No
                refresh needed - everything updates instantly across all
                devices. Stay connected and accountable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                🎤 Voice Logging
              </h4>
              <p className="text-xs text-gray-400">
                Hands-free activity logging. Just speak naturally: "We went on a
                30 minute walk" and the AI handles the rest. Perfect for logging
                while training.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                📊 RPG Progression
              </h4>
              <p className="text-xs text-gray-400">
                Watch your dog level up like a video game character. Every
                activity earns XP across four core stats. See tangible progress
                that keeps you motivated.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                🎯 Daily Goals & Streaks
              </h4>
              <p className="text-xs text-gray-400">
                Hit daily targets for physical and mental training. Build
                streaks to maintain consistency. Gamification makes training
                feel rewarding, not like a chore.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                😊 Mood Tracking
              </h4>
              <p className="text-xs text-gray-400">
                Monitor your dog's emotional state throughout the day. Track
                patterns and catch issues early. Better training starts with
                understanding your dog's wellbeing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">🎮 Quest System</h4>
              <p className="text-xs text-gray-400">
                Get AI-powered activity recommendations tailored to your dog's
                needs. Step-by-step quests guide you through effective training
                exercises.
              </p>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-1">
                🧠 Intelligence (INT)
              </h4>
              <p className="text-xs text-gray-400">
                Mental stimulation, puzzle toys, training sessions, and learning
                new commands.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                💪 Physical (PHY)
              </h4>
              <p className="text-xs text-gray-400">
                Exercise, walks, runs, fetch, and physical activities that build
                strength and endurance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                🎯 Impulse Control (IMP)
              </h4>
              <p className="text-xs text-gray-400">
                Self-control exercises, wait commands, leave it training, and
                managing reactivity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                🤝 Socialization (SOC)
              </h4>
              <p className="text-xs text-gray-400">
                Social interactions, meeting new people and dogs, exposure to
                new environments.
              </p>
            </div>
            <p className="text-xs text-gray-500 pt-2">
              Each stat levels up every 100 XP. Activities award XP based on
              type and duration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
