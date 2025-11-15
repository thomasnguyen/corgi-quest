import { Mic, TrendingUp, Users } from "lucide-react";

interface Step {
  icon: typeof Mic;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Mic,
    title: "Log what you already do",
    description:
      "Walks, training sessions, puzzle toys – log them in seconds, or just talk to the mic.",
  },
  {
    icon: TrendingUp,
    title: "Watch your dog level up",
    description:
      "Earn XP in INT, PHY, IMP, and SOC. Hit daily goals to keep streaks alive.",
  },
  {
    icon: Users,
    title: "Train together, not alone",
    description:
      "You and your partner share one dog profile and see updates in real time.",
  },
];

export function HowItWorks() {
  return (
    <div className="space-y-8 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 space-y-4"
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-300">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
