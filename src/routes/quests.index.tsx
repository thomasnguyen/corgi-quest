import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import Layout from "../components/layout/Layout";
import QuestCard from "../components/quests/QuestCard";
import QuestTabs from "../components/quests/QuestTabs";
import AIRecommendations from "../components/quests/AIRecommendations";
import { Zap, Brain } from "lucide-react";
import { useStaleQuery } from "../hooks/useStaleQuery";

export const Route = createFileRoute("/quests/")({
  component: QuestsPage,
});

// Quest data structure
interface Quest {
  id: string;
  name: string;
  category: "Physical" | "Mental";
  points: number;
  description: string;
}

// Static quest list from requirements
const QUESTS: Quest[] = [
  // Physical Quests
  {
    id: "morning-walk",
    name: "Morning Walk",
    category: "Physical",
    points: 30,
    description:
      "Take your dog for a morning walk to start the day with energy",
  },
  {
    id: "fetch-session",
    name: "Fetch Session",
    category: "Physical",
    points: 15,
    description: "Play fetch with your dog to build physical fitness",
  },
  {
    id: "dog-park-visit",
    name: "Dog Park Visit",
    category: "Physical",
    points: 40,
    description: "Visit the dog park for exercise and socialization",
  },
  {
    id: "long-walk",
    name: "Long Walk 60min+",
    category: "Physical",
    points: 50,
    description: "Take an extended walk of 60 minutes or more",
  },
  {
    id: "run-jog",
    name: "Run/Jog",
    category: "Physical",
    points: 45,
    description: "Go for a run or jog with your dog for cardiovascular fitness",
  },
  {
    id: "swimming",
    name: "Swimming",
    category: "Physical",
    points: 40,
    description: "Take your dog swimming for a full-body workout",
  },
  {
    id: "tug-of-war",
    name: "Tug-of-War",
    category: "Physical",
    points: 15,
    description: "Play tug-of-war to build strength and impulse control",
  },
  {
    id: "sniff-walk",
    name: "Sniff Walk",
    category: "Physical",
    points: 13,
    description:
      "Take a leisurely walk focused on letting your dog explore scents",
  },
  {
    id: "evening-walk",
    name: "Evening Walk",
    category: "Physical",
    points: 30,
    description: "Take your dog for an evening walk to wind down the day",
  },
  {
    id: "agility-practice",
    name: "Agility Practice",
    category: "Physical",
    points: 30,
    description: "Practice agility exercises to improve coordination and speed",
  },
  // Mental Quests
  {
    id: "training-session",
    name: "Training Session",
    category: "Mental",
    points: 20,
    description: "Practice obedience training and commands",
  },
  {
    id: "puzzle-toy",
    name: "Puzzle Toy",
    category: "Mental",
    points: 10,
    description: "Let your dog solve a puzzle toy for mental stimulation",
  },
  {
    id: "new-trick-training",
    name: "New Trick Training",
    category: "Mental",
    points: 25,
    description: "Teach your dog a new trick or command",
  },
  {
    id: "hide-and-seek",
    name: "Hide & Seek",
    category: "Mental",
    points: 15,
    description: "Play hide and seek to engage your dog's mind",
  },
  {
    id: "trick-practice",
    name: "Trick Practice",
    category: "Mental",
    points: 10,
    description:
      "Practice known tricks to reinforce learning and mental engagement",
  },
  {
    id: "grooming-session",
    name: "Grooming Session",
    category: "Mental",
    points: 8,
    description: "Groom your dog to build trust and provide mental stimulation",
  },
  {
    id: "scent-work",
    name: "Scent Work",
    category: "Mental",
    points: 15,
    description:
      "Engage your dog's natural scenting abilities with scent games",
  },
  {
    id: "obedience-drill",
    name: "Obedience Drill",
    category: "Mental",
    points: 12,
    description: "Practice focused obedience commands in quick succession",
  },
  {
    id: "interactive-play",
    name: "Interactive Play",
    category: "Mental",
    points: 12,
    description: "Engage in interactive games that challenge your dog's mind",
  },
  // Social/Mixed Quests
  {
    id: "playdate",
    name: "Playdate",
    category: "Physical",
    points: 15,
    description:
      "Arrange a playdate with another dog for socialization and exercise",
  },
  {
    id: "socialization-walk",
    name: "Socialization Walk",
    category: "Physical",
    points: 38,
    description: "Take a walk in a social environment to meet people and dogs",
  },
];

function QuestsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<"all" | "ai">("all");

  // Get first dog - use stale query to show cached data
  const firstDog = useStaleQuery(api.queries.getFirstDog, {});

  // Subscribe to activity feed for real-time quest completion detection - use stale query
  const activities = useStaleQuery(
    api.queries.getActivityFeed,
    firstDog ? { dogId: firstDog._id } : "skip"
  );

  // Loading state
  if (firstDog === undefined || activities === undefined) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-[#121216]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#f5c35f] border-t-transparent"></div>
            <p className="mt-4 text-[#f9dca0] text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Check which quests are completed today
  const completedQuestNames = new Set<string>();
  if (activities && Array.isArray(activities)) {
    activities.forEach((activity: any) => {
      const activityDate = new Date(activity.createdAt)
        .toISOString()
        .split("T")[0];
      if (activityDate === today) {
        // Normalize activity name for matching (case-insensitive, trim whitespace)
        const normalizedActivityName = activity.activityName
          .toLowerCase()
          .trim();

        // Check if activity name matches any quest name
        QUESTS.forEach((quest) => {
          const normalizedQuestName = quest.name.toLowerCase().trim();
          if (
            normalizedActivityName.includes(normalizedQuestName) ||
            normalizedQuestName.includes(normalizedActivityName)
          ) {
            completedQuestNames.add(quest.name);
          }
        });
      }
    });
  }

  // Group quests by category
  const physicalQuests = QUESTS.filter((q) => q.category === "Physical");
  const mentalQuests = QUESTS.filter((q) => q.category === "Mental");

  return (
    <Layout>
      <div className="relative min-h-screen bg-[#121216] pb-32">
        {/* Background atmospheric effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-[#492e25]/20 via-[#2f2120]/20 to-[#141b1b]/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-5 pt-5">
          <h1 className="text-2xl font-bold mb-6 text-[#feefd0]">QUESTS</h1>

          {/* Quest Tabs */}
          <QuestTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Conditionally render based on active tab */}
          {activeTab === "all" ? (
            <>
              {/* Physical Quests Section */}
              <div className="mb-8">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2 text-[#feefd0] flex items-center gap-2">
                    <Zap size={20} strokeWidth={2} className="text-[#fcd587]" />
                    PHYSICAL
                  </h2>
                  <p className="text-[#f9dca0] text-sm leading-relaxed">
                    Physical fitness keeps your dog healthy, strong, and full of
                    energy. Regular exercise helps maintain a healthy weight and
                    improves overall wellbeing.
                  </p>
                </div>
                <div className="space-y-2">
                  {physicalQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      id={quest.id}
                      name={quest.name}
                      category={quest.category}
                      points={quest.points}
                      description={quest.description}
                      isCompleted={completedQuestNames.has(quest.name)}
                    />
                  ))}
                </div>
              </div>

              {/* Mental Quests Section */}
              <div className="mb-8">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2 text-[#feefd0] flex items-center gap-2">
                    <Brain
                      size={20}
                      strokeWidth={2}
                      className="text-[#fcd587]"
                    />
                    MENTAL
                  </h2>
                  <p className="text-[#f9dca0] text-sm leading-relaxed">
                    Mental stimulation keeps your dog's mind sharp and engaged.
                    Puzzle toys and training exercises help prevent boredom and
                    build problem-solving skills.
                  </p>
                </div>
                <div className="space-y-2">
                  {mentalQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      id={quest.id}
                      name={quest.name}
                      category={quest.category}
                      points={quest.points}
                      description={quest.description}
                      isCompleted={completedQuestNames.has(quest.name)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <AIRecommendations />
          )}
        </div>
      </div>
    </Layout>
  );
}
