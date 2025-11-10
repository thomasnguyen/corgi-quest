import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Layout from "../components/layout/Layout";
import QuestCard from "../components/quests/QuestCard";
import { Zap, Brain } from "lucide-react";

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
];

function QuestsPage() {
  // Get first dog
  const firstDog = useQuery(api.queries.getFirstDog);

  // Subscribe to activity feed for real-time quest completion detection
  const activities = useQuery(
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
  if (activities) {
    activities.forEach((activity) => {
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

          {/* Physical Quests Section */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 text-[#feefd0] flex items-center gap-2">
                <Zap size={20} strokeWidth={2} className="text-[#fcd587]" />
                PHYSICAL
              </h2>
              <p className="text-[#f9dca0] text-sm leading-relaxed">
                Physical fitness keeps your dog healthy, strong, and full of energy. Regular exercise helps maintain a healthy weight and improves overall wellbeing.
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
                <Brain size={20} strokeWidth={2} className="text-[#fcd587]" />
                MENTAL
              </h2>
              <p className="text-[#f9dca0] text-sm leading-relaxed">
                Mental stimulation keeps your dog's mind sharp and engaged. Puzzle toys and training exercises help prevent boredom and build problem-solving skills.
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
        </div>
      </div>
    </Layout>
  );
}
