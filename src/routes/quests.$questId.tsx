import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Zap, Brain, Mic } from "lucide-react";
import Layout from "../components/layout/Layout";

export const Route = createFileRoute("/quests/$questId")({
  component: QuestDetailPage,
});

// Quest data structure (same as in quests.tsx)
interface Quest {
  id: string;
  name: string;
  category: "Physical" | "Mental";
  points: number;
  description: string;
  instructions: string;
}

// Static quest list with detailed instructions
const QUESTS: Quest[] = [
  // Physical Quests
  {
    id: "morning-walk",
    name: "Morning Walk",
    category: "Physical",
    points: 30,
    description:
      "Take your dog for a morning walk to start the day with energy",
    instructions:
      "Take your dog for a 20-30 minute walk in the morning. This helps establish a routine and provides physical exercise to start the day. Walk at a steady pace and allow your dog to explore their surroundings.",
  },
  {
    id: "fetch-session",
    name: "Fetch Session",
    category: "Physical",
    points: 15,
    description: "Play fetch with your dog to build physical fitness",
    instructions:
      "Find an open space and play fetch with your dog for 10-15 minutes. Use a ball or favorite toy. This activity builds physical fitness and reinforces the 'drop it' command.",
  },
  {
    id: "dog-park-visit",
    name: "Dog Park Visit",
    category: "Physical",
    points: 40,
    description: "Visit the dog park for exercise and socialization",
    instructions:
      "Take your dog to a local dog park for 30-45 minutes. This provides both physical exercise and social interaction with other dogs. Monitor your dog's behavior and ensure positive interactions.",
  },
  {
    id: "long-walk",
    name: "Long Walk 60min+",
    category: "Physical",
    points: 50,
    description: "Take an extended walk of 60 minutes or more",
    instructions:
      "Plan a long walk of at least 60 minutes. This could be a hike, a walk through different neighborhoods, or exploring a new trail. Bring water for both you and your dog. This provides excellent physical exercise and mental stimulation.",
  },
  // Mental Quests
  {
    id: "training-session",
    name: "Training Session",
    category: "Mental",
    points: 20,
    description: "Practice obedience training and commands",
    instructions:
      "Spend 15-20 minutes practicing obedience commands like sit, stay, come, and down. Use positive reinforcement with treats or praise. Keep sessions short and fun to maintain your dog's attention.",
  },
  {
    id: "puzzle-toy",
    name: "Puzzle Toy",
    category: "Mental",
    points: 10,
    description: "Let your dog solve a puzzle toy for mental stimulation",
    instructions:
      "Set up a puzzle toy filled with treats or kibble. Let your dog work on solving it for 10-15 minutes. This provides mental stimulation and helps prevent boredom. Supervise to ensure they don't get frustrated.",
  },
  {
    id: "new-trick-training",
    name: "New Trick Training",
    category: "Mental",
    points: 25,
    description: "Teach your dog a new trick or command",
    instructions:
      "Choose a new trick to teach your dog (shake, roll over, spin, etc.). Break it down into small steps and use positive reinforcement. Practice for 10-15 minutes. Be patient - learning new tricks takes time!",
  },
  {
    id: "hide-and-seek",
    name: "Hide & Seek",
    category: "Mental",
    points: 15,
    description: "Play hide and seek to engage your dog's mind",
    instructions:
      "Hide treats or toys around your home or yard and encourage your dog to find them. Start easy and gradually increase difficulty. This engages their natural scenting abilities and provides mental stimulation.",
  },
];

function QuestDetailPage() {
  const { questId } = Route.useParams();
  const navigate = useNavigate();

  // Look up quest data from static list
  const quest = QUESTS.find((q) => q.id === questId);

  // Handle quest not found
  if (!quest) {
    return (
      <Layout>
        <div className="relative min-h-screen bg-[#121216] pb-32">
          <div className="relative z-10 px-5 pt-5">
            <button
              onClick={() => navigate({ to: "/quests" })}
              className="inline-flex items-center gap-2 text-[#f9dca0] hover:text-[#fcd587] transition-colors mb-6"
            >
              <ArrowLeft size={20} strokeWidth={2} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="text-center py-12">
              <p className="text-[#f9dca0] text-sm">Quest not found</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCompleteQuest = () => {
    // Navigate to log-activity route with quest name in search params
    navigate({
      to: "/log-activity",
      search: { questName: quest.name },
    });
  };

  return (
    <Layout>
      <div className="relative min-h-screen bg-[#121216] pb-32">
        {/* Background atmospheric effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-[#492e25]/20 via-[#2f2120]/20 to-[#141b1b]/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header with Back Button */}
          <div className="px-5 pt-5 pb-4">
            <button
              onClick={() => navigate({ to: "/quests" })}
              className="inline-flex items-center gap-2 text-[#f9dca0] hover:text-[#fcd587] transition-colors mb-4"
            >
              <ArrowLeft size={20} strokeWidth={2} />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Quest Name and Category */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                {quest.category === "Physical" ? (
                  <Zap size={32} strokeWidth={2} className="text-[#fcd587]" />
                ) : (
                  <Brain size={32} strokeWidth={2} className="text-[#fcd587]" />
                )}
                <h1
                  className="text-3xl font-bold text-[#fcd587]"
                  style={{
                    textShadow: "0px 1px 1px #1e1e1e",
                  }}
                >
                  {quest.name}
                </h1>
              </div>
              {/* Category badge and points */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="inline-flex items-center gap-2 border border-[#3d3d3d]/50 px-3 py-1 text-sm font-medium text-[#f9dca0] bg-[#1a1a1e]/50 rounded">
                  {quest.category === "Physical" ? (
                    <Zap size={16} strokeWidth={2} className="text-[#f5c35f]" />
                  ) : (
                    <Brain size={16} strokeWidth={2} className="text-[#f5c35f]" />
                  )}
                  {quest.category.toUpperCase()}
                </span>
                <span className="font-mono font-bold text-xl text-[#f5c35f]">
                  {quest.points} pts
                </span>
              </div>
            </div>
          </div>

          {/* Quest Description */}
          <div className="px-5 mb-6">
            <div className="bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#3d3d3d]/50 rounded-lg p-4">
              <h2 className="text-[#feefd0] text-lg font-semibold mb-3">
                Description
              </h2>
              <p className="text-[#f9dca0] text-sm leading-relaxed">
                {quest.description}
              </p>
            </div>
          </div>

          {/* Quest Instructions */}
          <div className="px-5 mb-8">
            <div className="bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#3d3d3d]/50 rounded-lg p-4">
              <h2 className="text-[#feefd0] text-lg font-semibold mb-3">
                Instructions
              </h2>
              <p className="text-[#f9dca0] text-sm leading-relaxed">
                {quest.instructions}
              </p>
            </div>
          </div>

          {/* Complete Quest button */}
          <div className="px-5">
            <button
              onClick={handleCompleteQuest}
              className="w-full bg-gradient-to-r from-[#c6a755] to-[#fff1ab] text-[#121216] font-bold py-4 px-6 rounded-lg hover:from-[#d4b565] hover:to-[#fff8c4] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <Mic size={20} strokeWidth={2} />
              COMPLETE QUEST
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
