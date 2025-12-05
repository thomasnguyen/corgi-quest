import { Mic, MessageCircle, Target, Map, Sparkles } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-[#121216] border border-[#f5c35f]/20 rounded-lg p-6 hover:border-[#f5c35f]/40 transition-colors">
      <div className="flex items-start gap-4">
        <div className="text-[#f5c35f] flex-shrink-0">{icon}</div>
        <div>
          <h3 className="text-[#feefd0] font-bold text-lg mb-2">{title}</h3>
          <p className="text-[#f9dca0] text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeatureGrid() {
  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Logging",
      description:
        "Hands-free activity logging during training. OpenAI parses natural speech into structured XP.",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Coach Mode",
      description:
        "AI-guided training with rep counting and real-time feedback during live sessions.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goals & Streaks",
      description:
        "Daily physical and mental training targets with streak tracking.",
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Quests",
      description:
        "Curated training activities with AI recommendations from expert sources.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Cosmetics",
      description: "AI-generated dog transformations on level-up using DALL·E.",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent mb-3">
          Core Features
        </h2>
        <p className="text-[#f9dca0] max-w-2xl mx-auto">
          Everything you need to turn dog training into a shared adventure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}
