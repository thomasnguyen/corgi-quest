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
  {
    id: "run-jog",
    name: "Run/Jog",
    category: "Physical",
    points: 45,
    description: "Go for a run or jog with your dog for cardiovascular fitness",
    instructions:
      "Take your dog for a 20-30 minute run or jog. Start with a warm-up walk, then gradually increase pace. Ensure your dog is fit enough for running and watch for signs of fatigue. This provides excellent cardiovascular exercise for both of you.",
  },
  {
    id: "swimming",
    name: "Swimming",
    category: "Physical",
    points: 40,
    description: "Take your dog swimming for a full-body workout",
    instructions:
      "Find a safe swimming location (pool, lake, or beach) and let your dog swim for 15-20 minutes. Supervise closely and ensure your dog knows how to swim. Swimming is a low-impact, full-body exercise that's great for dogs with joint issues.",
  },
  {
    id: "tug-of-war",
    name: "Tug-of-War",
    category: "Physical",
    points: 15,
    description: "Play tug-of-war to build strength and impulse control",
    instructions:
      "Use a sturdy rope toy and play tug-of-war for 10-15 minutes. Teach your dog to release on command ('drop it') to build impulse control. This activity builds strength and provides mental stimulation through the game rules.",
  },
  {
    id: "sniff-walk",
    name: "Sniff Walk",
    category: "Physical",
    points: 13,
    description: "Take a leisurely walk focused on letting your dog explore scents",
    instructions:
      "Take a 20-30 minute walk at a slower pace, allowing your dog to stop and sniff frequently. Let them lead and explore interesting scents. This provides both physical exercise and mental stimulation through scent exploration.",
  },
  {
    id: "evening-walk",
    name: "Evening Walk",
    category: "Physical",
    points: 30,
    description: "Take your dog for an evening walk to wind down the day",
    instructions:
      "Take your dog for a 20-30 minute walk in the evening. This helps them wind down after the day and provides exercise before bedtime. Walk at a comfortable pace and enjoy the quiet time together.",
  },
  {
    id: "agility-practice",
    name: "Agility Practice",
    category: "Physical",
    points: 30,
    description: "Practice agility exercises to improve coordination and speed",
    instructions:
      "Set up simple agility obstacles (jumps, tunnels, weave poles) or use natural obstacles. Practice for 15-20 minutes, focusing on fun and positive reinforcement. This improves coordination, speed, and builds confidence.",
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
  {
    id: "trick-practice",
    name: "Trick Practice",
    category: "Mental",
    points: 10,
    description: "Practice known tricks to reinforce learning and mental engagement",
    instructions:
      "Practice tricks your dog already knows (sit, stay, shake, roll over, etc.) for 10-15 minutes. Use positive reinforcement and keep sessions fun. This reinforces training and provides mental stimulation through repetition and reward.",
  },
  {
    id: "grooming-session",
    name: "Grooming Session",
    category: "Mental",
    points: 8,
    description: "Groom your dog to build trust and provide mental stimulation",
    instructions:
      "Spend 15-20 minutes grooming your dog - brushing, checking ears, trimming nails if needed. Make it a positive experience with treats and praise. This builds trust, provides mental stimulation through handling, and keeps your dog healthy.",
  },
  {
    id: "scent-work",
    name: "Scent Work",
    category: "Mental",
    points: 15,
    description: "Engage your dog's natural scenting abilities with scent games",
    instructions:
      "Hide treats or a favorite toy in various locations and encourage your dog to find them using their nose. Start with easy hiding spots and gradually increase difficulty. This provides excellent mental stimulation and taps into your dog's natural abilities.",
  },
  {
    id: "obedience-drill",
    name: "Obedience Drill",
    category: "Mental",
    points: 12,
    description: "Practice focused obedience commands in quick succession",
    instructions:
      "Practice a series of obedience commands (sit, down, stay, come) in quick succession for 10-15 minutes. Keep sessions fast-paced and reward correct responses. This improves focus, response time, and reinforces training.",
  },
  {
    id: "interactive-play",
    name: "Interactive Play",
    category: "Mental",
    points: 12,
    description: "Engage in interactive games that challenge your dog's mind",
    instructions:
      "Play interactive games like 'find it', 'which hand', or puzzle-based games for 10-15 minutes. These games require your dog to think and problem-solve. Keep it fun and reward successful problem-solving.",
  },
  // Social/Mixed Quests
  {
    id: "playdate",
    name: "Playdate",
    category: "Physical",
    points: 15,
    description: "Arrange a playdate with another dog for socialization and exercise",
    instructions:
      "Arrange a playdate with a compatible dog friend. Supervise the interaction and ensure both dogs are comfortable. Let them play for 30-45 minutes. This provides physical exercise, socialization, and mental stimulation through social interaction.",
  },
  {
    id: "socialization-walk",
    name: "Socialization Walk",
    category: "Physical",
    points: 38,
    description: "Take a walk in a social environment to meet people and dogs",
    instructions:
      "Take a 25-30 minute walk in a social environment like a busy park, downtown area, or dog-friendly neighborhood. Allow your dog to meet friendly people and dogs (with permission). This provides exercise, socialization, and builds confidence in social situations.",
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
