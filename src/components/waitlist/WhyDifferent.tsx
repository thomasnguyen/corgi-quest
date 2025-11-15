import { Check } from "lucide-react";

interface Differentiator {
  title: string;
  description: string;
}

const differentiators: Differentiator[] = [
  {
    title: "Consistency engine",
    description:
      "We're not another 'how to train your dog' course – we're the consistency engine.",
  },
  {
    title: "Built for households",
    description: "Designed for pairs/households, not just solo owners.",
  },
  {
    title: "Gamification first",
    description:
      "Built around gamification – streaks, quests, stats – not dry checklists.",
  },
];

export function WhyDifferent() {
  return (
    <div className="space-y-8 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
        Why It's Different
      </h2>

      <div className="space-y-4 max-w-2xl mx-auto">
        {differentiators.map((item, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 sm:p-6 flex gap-3 sm:gap-4"
          >
            <div className="flex-shrink-0 pt-1">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-black" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-300">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
