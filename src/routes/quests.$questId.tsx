import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Dumbbell, Brain, Mic } from "lucide-react";
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
        <div className="p-6 pb-32">
          <button
            onClick={() => navigate({ to: "/quests" })}
            className="flex items-center gap-2 mb-6 text-black hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            <span className="font-bold">BACK</span>
          </button>
          <div className="text-center py-12">
            <p className="text-gray-600">Quest not found</p>
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
      <div className="p-6 pb-32">
        {/* Back button */}
        <button
          onClick={() => navigate({ to: "/quests" })}
          className="flex items-center gap-2 mb-6 text-black hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          <span className="font-bold">BACK</span>
        </button>

        {/* Quest header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-3 text-black">{quest.name}</h1>

          {/* Category badge and points */}
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-flex items-center gap-2 border-2 border-black px-3 py-1 text-sm font-bold text-black">
              {quest.category === "Physical" ? (
                <Dumbbell size={16} strokeWidth={2} />
              ) : (
                <Brain size={16} strokeWidth={2} />
              )}
              {quest.category.toUpperCase()}
            </span>
            <span className="font-mono font-bold text-xl text-black">
              {quest.points} pts
            </span>
          </div>
        </div>

        {/* Quest description */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 text-black">Description</h2>
          <p className="text-gray-700 leading-relaxed">{quest.description}</p>
        </div>

        {/* Quest instructions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2 text-black">Instructions</h2>
          <p className="text-gray-700 leading-relaxed">{quest.instructions}</p>
        </div>

        {/* Complete Quest button */}
        <button
          onClick={handleCompleteQuest}
          className="w-full bg-black text-white font-bold py-4 px-6 border-2 border-black hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
        >
          <Mic size={20} strokeWidth={2} />
          COMPLETE QUEST
        </button>
      </div>
    </Layout>
  );
}
