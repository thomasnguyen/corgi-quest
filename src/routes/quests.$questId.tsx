import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Zap,
  Brain,
  Mic,
  MapPin,
  Clock,
  Trophy,
  Crown,
  Star,
  Target,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { getIcon } from "./quests.index";

type IconName =
  | "Sun"
  | "Moon"
  | "Activity"
  | "Users"
  | "Waves"
  | "Target"
  | "GraduationCap"
  | "Puzzle"
  | "Sparkles"
  | "Eye"
  | "Repeat"
  | "Scissors"
  | "Search"
  | "Gamepad2"
  | "Heart"
  | "Zap"
  | "Brain";

export const Route = createFileRoute("/quests/$questId")({
  component: QuestDetailPage,
});

// Quest data structure
interface Quest {
  id: string;
  name: string;
  category: "Physical" | "Mental";
  points: number;
  description: string;
  instructions: string;
  iconName: IconName;
  location?: string;
  estimatedTime?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "Epic";
  isBoss?: boolean;
  rewards?: {
    xp?: number;
    statGains?: string[];
    unlock?: string;
  };
}

// Static quest list with detailed instructions
const QUEST_DETAILS: Quest[] = [
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
    iconName: "Sun",
    estimatedTime: "20-30 min",
    difficulty: "Easy",
  },
  {
    id: "fetch-session",
    name: "Fetch Session",
    category: "Physical",
    points: 15,
    description: "Play fetch with your dog to build physical fitness",
    instructions:
      "Find an open space and play fetch with your dog for 10-15 minutes. Use a ball or favorite toy. This activity builds physical fitness and reinforces the 'drop it' command.",
    iconName: "Activity",
    estimatedTime: "10-15 min",
    difficulty: "Easy",
  },
  {
    id: "dog-park-visit",
    name: "Dog Park Visit",
    category: "Physical",
    points: 40,
    description: "Visit the dog park for exercise and socialization",
    instructions:
      "Take your dog to a local dog park for 30-45 minutes. This provides both physical exercise and social interaction with other dogs. Monitor your dog's behavior and ensure positive interactions.",
    iconName: "Users",
    location: "Dog Park",
    estimatedTime: "30-45 min",
    difficulty: "Medium",
    rewards: {
      xp: 40,
      statGains: ["PHY +15", "SOC +10"],
    },
  },
  {
    id: "long-walk",
    name: "Long Walk 60min+",
    category: "Physical",
    points: 50,
    description: "Take an extended walk of 60 minutes or more",
    instructions:
      "Plan a long walk of at least 60 minutes. This could be a hike, a walk through different neighborhoods, or exploring a new trail. Bring water for both you and your dog. This provides excellent physical exercise and mental stimulation.",
    iconName: "Activity",
    estimatedTime: "60+ min",
    difficulty: "Hard",
    rewards: {
      xp: 50,
      statGains: ["PHY +20", "IMP +5"],
    },
  },
  {
    id: "run-jog",
    name: "Run/Jog",
    category: "Physical",
    points: 45,
    description: "Go for a run or jog with your dog for cardiovascular fitness",
    instructions:
      "Take your dog for a 20-30 minute run or jog. Start with a warm-up walk, then gradually increase pace. Ensure your dog is fit enough for running and watch for signs of fatigue. This provides excellent cardiovascular exercise for both of you.",
    iconName: "Activity",
    estimatedTime: "20-30 min",
    difficulty: "Hard",
    rewards: {
      xp: 45,
      statGains: ["PHY +18", "IMP +8"],
    },
  },
  {
    id: "swimming",
    name: "Swimming",
    category: "Physical",
    points: 40,
    description: "Take your dog swimming for a full-body workout",
    instructions:
      "Find a safe swimming location (pool, lake, or beach) and let your dog swim for 15-20 minutes. Supervise closely and ensure your dog knows how to swim. Swimming is a low-impact, full-body exercise that's great for dogs with joint issues.",
    iconName: "Waves",
    estimatedTime: "15-20 min",
    difficulty: "Medium",
    rewards: {
      xp: 40,
      statGains: ["PHY +15", "IMP +5"],
    },
  },
  {
    id: "tug-of-war",
    name: "Tug-of-War",
    category: "Physical",
    points: 15,
    description: "Play tug-of-war to build strength and impulse control",
    instructions:
      "Use a sturdy rope toy and play tug-of-war for 10-15 minutes. Teach your dog to release on command ('drop it') to build impulse control. This activity builds strength and provides mental stimulation through the game rules.",
    iconName: "Activity",
    estimatedTime: "10-15 min",
    difficulty: "Easy",
  },
  {
    id: "sniff-walk",
    name: "Sniff Walk",
    category: "Physical",
    points: 13,
    description:
      "Take a leisurely walk focused on letting your dog explore scents",
    instructions:
      "Take a 20-30 minute walk at a slower pace, allowing your dog to stop and sniff frequently. Let them lead and explore interesting scents. This provides both physical exercise and mental stimulation through scent exploration.",
    iconName: "Search",
    estimatedTime: "20-30 min",
    difficulty: "Easy",
  },
  {
    id: "evening-walk",
    name: "Evening Walk",
    category: "Physical",
    points: 30,
    description: "Take your dog for an evening walk to wind down the day",
    instructions:
      "Take your dog for a 20-30 minute walk in the evening. This helps them wind down after the day and provides exercise before bedtime. Walk at a comfortable pace and enjoy the quiet time together.",
    iconName: "Moon",
    estimatedTime: "20-30 min",
    difficulty: "Easy",
  },
  {
    id: "agility-practice",
    name: "Agility Practice",
    category: "Physical",
    points: 30,
    description: "Practice agility exercises to improve coordination and speed",
    instructions:
      "Set up simple agility obstacles (jumps, tunnels, weave poles) or use natural obstacles. Practice for 15-20 minutes, focusing on fun and positive reinforcement. This improves coordination, speed, and builds confidence.",
    iconName: "Target",
    estimatedTime: "15-20 min",
    difficulty: "Medium",
    rewards: {
      xp: 30,
      statGains: ["PHY +10", "IMP +8"],
    },
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
    iconName: "GraduationCap",
    estimatedTime: "15-20 min",
    difficulty: "Easy",
  },
  {
    id: "puzzle-toy",
    name: "Puzzle Toy",
    category: "Mental",
    points: 10,
    description: "Let your dog solve a puzzle toy for mental stimulation",
    instructions:
      "Set up a puzzle toy filled with treats or kibble. Let your dog work on solving it for 10-15 minutes. This provides mental stimulation and helps prevent boredom. Supervise to ensure they don't get frustrated.",
    iconName: "Puzzle",
    estimatedTime: "10-15 min",
    difficulty: "Easy",
  },
  {
    id: "new-trick-training",
    name: "New Trick Training",
    category: "Mental",
    points: 25,
    description: "Teach your dog a new trick or command",
    instructions:
      "Choose a new trick to teach your dog (shake, roll over, spin, etc.). Break it down into small steps and use positive reinforcement. Practice for 10-15 minutes. Be patient - learning new tricks takes time!",
    iconName: "Sparkles",
    estimatedTime: "10-15 min",
    difficulty: "Medium",
    rewards: {
      xp: 25,
      statGains: ["INT +12", "IMP +5"],
    },
  },
  {
    id: "hide-and-seek",
    name: "Hide & Seek",
    category: "Mental",
    points: 15,
    description: "Play hide and seek to engage your dog's mind",
    instructions:
      "Hide treats or toys around your home or yard and encourage your dog to find them. Start easy and gradually increase difficulty. This engages their natural scenting abilities and provides mental stimulation.",
    iconName: "Eye",
    estimatedTime: "15-20 min",
    difficulty: "Easy",
  },
  {
    id: "trick-practice",
    name: "Trick Practice",
    category: "Mental",
    points: 10,
    description:
      "Practice known tricks to reinforce learning and mental engagement",
    instructions:
      "Practice tricks your dog already knows (sit, stay, shake, roll over, etc.) for 10-15 minutes. Use positive reinforcement and keep sessions fun. This reinforces training and provides mental stimulation through repetition and reward.",
    iconName: "Repeat",
    estimatedTime: "10-15 min",
    difficulty: "Easy",
  },
  {
    id: "grooming-session",
    name: "Grooming Session",
    category: "Mental",
    points: 8,
    description: "Groom your dog to build trust and provide mental stimulation",
    instructions:
      "Spend 15-20 minutes grooming your dog - brushing, checking ears, trimming nails if needed. Make it a positive experience with treats and praise. This builds trust, provides mental stimulation through handling, and keeps your dog healthy.",
    iconName: "Scissors",
    estimatedTime: "15-20 min",
    difficulty: "Easy",
  },
  {
    id: "scent-work",
    name: "Scent Work",
    category: "Mental",
    points: 15,
    description:
      "Engage your dog's natural scenting abilities with scent games",
    instructions:
      "Hide treats or a favorite toy in various locations and encourage your dog to find them using their nose. Start with easy hiding spots and gradually increase difficulty. This provides excellent mental stimulation and taps into your dog's natural abilities.",
    iconName: "Search",
    estimatedTime: "15-20 min",
    difficulty: "Easy",
  },
  {
    id: "obedience-drill",
    name: "Obedience Drill",
    category: "Mental",
    points: 12,
    description: "Practice focused obedience commands in quick succession",
    instructions:
      "Practice a series of obedience commands (sit, down, stay, come) in quick succession for 10-15 minutes. Keep sessions fast-paced and reward correct responses. This improves focus, response time, and reinforces training.",
    iconName: "GraduationCap",
    estimatedTime: "10-15 min",
    difficulty: "Easy",
  },
  {
    id: "interactive-play",
    name: "Interactive Play",
    category: "Mental",
    points: 12,
    description: "Engage in interactive games that challenge your dog's mind",
    instructions:
      "Play interactive games like 'find it', 'which hand', or puzzle-based games for 10-15 minutes. These games require your dog to think and problem-solve. Keep it fun and reward successful problem-solving.",
    iconName: "Gamepad2",
    estimatedTime: "10-15 min",
    difficulty: "Easy",
  },
  // Social/Mixed Quests
  {
    id: "playdate",
    name: "Playdate",
    category: "Physical",
    points: 15,
    description:
      "Arrange a playdate with another dog for socialization and exercise",
    instructions:
      "Arrange a playdate with a compatible dog friend. Supervise the interaction and ensure both dogs are comfortable. Let them play for 30-45 minutes. This provides physical exercise, socialization, and mental stimulation through social interaction.",
    iconName: "Heart",
    estimatedTime: "30-45 min",
    difficulty: "Easy",
  },
  {
    id: "socialization-walk",
    name: "Socialization Walk",
    category: "Physical",
    points: 38,
    description: "Take a walk in a social environment to meet people and dogs",
    instructions:
      "Take a 25-30 minute walk in a social environment like a busy park, downtown area, or dog-friendly neighborhood. Allow your dog to meet friendly people and dogs (with permission). This provides exercise, socialization, and builds confidence in social situations.",
    iconName: "Users",
    estimatedTime: "25-30 min",
    difficulty: "Medium",
    rewards: {
      xp: 38,
      statGains: ["PHY +12", "SOC +15"],
    },
  },
  // Boss Quest
  {
    id: "skate-park-adventure",
    name: "Skate Park Adventure",
    category: "Physical",
    points: 75,
    description:
      "Conquer the skate park - the ultimate test of agility and courage",
    instructions:
      "Visit a skate park (when safe and allowed) and let your dog explore the ramps and obstacles. This is an advanced activity that requires careful supervision and a confident, well-trained dog. Ensure the area is clear of skaters and safe for your dog to explore.",
    iconName: "Target",
    location: "Skate Park",
    estimatedTime: "45-60 min",
    difficulty: "Epic",
    isBoss: true,
    rewards: {
      xp: 75,
      statGains: ["PHY +25", "IMP +15", "SOC +10"],
      unlock: "Skate Park Master Badge",
    },
  },
];

function QuestDetailPage() {
  const { questId } = Route.useParams();
  const navigate = useNavigate();

  // Look up quest data from static list
  const quest = QUEST_DETAILS.find((q) => q.id === questId);
  const Icon = quest ? getIcon(quest.iconName) : Zap;

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
        {/* Background effects - enhanced for boss quests */}
        <div className="absolute inset-0 pointer-events-none">
          {quest.isBoss ? (
            <>
              <div className="absolute inset-0 bg-gradient-radial from-[#f5c35f]/10 via-[#c6a755]/5 to-transparent"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,195,95,0.1)_0%,transparent_70%)]"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-radial from-[#492e25]/20 via-[#2f2120]/20 to-[#141b1b]/20"></div>
          )}
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

            {/* Quest Header with Icon */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div
                  className={`relative ${quest.isBoss ? "animate-pulse" : ""}`}
                >
                  <div
                    className={`w-16 h-16 rounded-xl bg-[#2a2a2e]/80 border-2 ${
                      quest.isBoss
                        ? "border-[#f5c35f] shadow-lg shadow-[#f5c35f]/20"
                        : "border-[#3d3d3d]/50"
                    } flex items-center justify-center`}
                  >
                    <Icon
                      size={32}
                      strokeWidth={2}
                      className="text-[#f5c35f]"
                    />
                  </div>
                  {quest.isBoss && (
                    <Crown
                      className="absolute -top-2 -right-2 w-6 h-6 text-[#f5c35f]"
                      fill="currentColor"
                    />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#fcd587] mb-1">
                    {quest.name}
                  </h1>
                  {quest.isBoss && (
                    <div className="flex items-center justify-center gap-1 text-[#f5c35f] text-xs font-bold">
                      <Star size={12} fill="currentColor" />
                      <span>FINAL BOSS</span>
                      <Star size={12} fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>

              {/* Meta info badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                <span className="inline-flex items-center gap-2 border border-[#3d3d3d]/50 px-3 py-1 text-sm font-medium text-[#f9dca0] bg-[#1a1a1e]/50 rounded">
                  {quest.category === "Physical" ? (
                    <Zap size={16} strokeWidth={2} className="text-[#f5c35f]" />
                  ) : (
                    <Brain
                      size={16}
                      strokeWidth={2}
                      className="text-[#f5c35f]"
                    />
                  )}
                  {quest.category.toUpperCase()}
                </span>
                <span className="font-mono font-bold text-xl text-[#f5c35f]">
                  {quest.points} pts
                </span>
                {quest.difficulty && (
                  <span
                    className={`inline-flex items-center gap-1 border px-3 py-1 text-xs font-medium rounded ${
                      quest.difficulty === "Epic"
                        ? "border-[#f5c35f] text-[#f5c35f] bg-[#f5c35f]/10"
                        : quest.difficulty === "Hard"
                          ? "border-[#c6a755] text-[#c6a755] bg-[#c6a755]/10"
                          : "border-[#3d3d3d]/50 text-[#f9dca0] bg-[#1a1a1e]/50"
                    }`}
                  >
                    <Target size={12} strokeWidth={2} />
                    {quest.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Location & Time Info */}
          {(quest.location || quest.estimatedTime) && (
            <div className="px-5 mb-4">
              <div className="bg-[#1a1a1e]/80 backdrop-blur-sm border border-[#3d3d3d]/50 rounded-lg p-4">
                <div className="flex items-center gap-4 text-sm">
                  {quest.location && (
                    <div className="flex items-center gap-2 text-[#f9dca0]">
                      <MapPin
                        size={16}
                        strokeWidth={2}
                        className="text-[#f5c35f]"
                      />
                      <span>{quest.location}</span>
                    </div>
                  )}
                  {quest.estimatedTime && (
                    <div className="flex items-center gap-2 text-[#f9dca0]">
                      <Clock
                        size={16}
                        strokeWidth={2}
                        className="text-[#f5c35f]"
                      />
                      <span>{quest.estimatedTime}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rewards Section */}
          {quest.rewards && (
            <div className="px-5 mb-4">
              <div className="bg-gradient-to-br from-[#f5c35f]/10 to-[#c6a755]/5 border border-[#f5c35f]/20 rounded-lg p-4">
                <h3 className="text-[#feefd0] text-sm font-semibold mb-2 flex items-center gap-2">
                  <Trophy
                    size={16}
                    strokeWidth={2}
                    className="text-[#f5c35f]"
                  />
                  REWARDS
                </h3>
                <div className="space-y-1">
                  {quest.rewards.xp && (
                    <div className="text-[#f9dca0] text-sm">
                      <span className="font-mono font-bold text-[#f5c35f]">
                        {quest.rewards.xp} XP
                      </span>
                    </div>
                  )}
                  {quest.rewards.statGains &&
                    quest.rewards.statGains.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {quest.rewards.statGains.map((stat, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-[#1a1a1e]/50 border border-[#3d3d3d]/50 rounded text-[#f9dca0]"
                          >
                            {stat}
                          </span>
                        ))}
                      </div>
                    )}
                  {quest.rewards.unlock && (
                    <div className="mt-2 text-xs text-[#f5c35f] font-medium">
                      ✨ Unlocks: {quest.rewards.unlock}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
              className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                quest.isBoss
                  ? "bg-gradient-to-r from-[#f5c35f] to-[#c6a755] text-[#121216] hover:from-[#fcd587] hover:to-[#d4b565] animate-pulse"
                  : "bg-gradient-to-r from-[#c6a755] to-[#fff1ab] text-[#121216] hover:from-[#d4b565] hover:to-[#fff8c4]"
              }`}
            >
              <Mic size={20} strokeWidth={2} />
              {quest.isBoss ? "FACE THE BOSS" : "COMPLETE QUEST"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
