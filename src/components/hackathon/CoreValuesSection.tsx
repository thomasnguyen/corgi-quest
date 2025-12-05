import { Users, Mic, Glasses } from "lucide-react";

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <div className="bg-[#121216] border border-[#f5c35f]/20 rounded-lg p-6 hover:border-[#f5c35f]/40 transition-colors">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="text-[#f5c35f] w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-[#feefd0] text-xl font-bold">{title}</h3>
        <p className="text-[#f9dca0] text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function CoreValuesSection() {
  const values = [
    {
      icon: <Users size={48} strokeWidth={1.5} />,
      title: "Real-Time Couples Sync",
      description:
        "Partners see each other's training progress instantly via Convex subscriptions",
    },
    {
      icon: <Mic size={48} strokeWidth={1.5} />,
      title: "AI Voice Coach Mode",
      description:
        "Hands-free training with OpenAI-powered voice parsing and rep counting",
    },
    {
      icon: <Glasses size={48} strokeWidth={1.5} />,
      title: "Vision Pro Training HUD",
      description:
        "Live stats and goals floating in your space during real training sessions",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
          Why Corgi Quest?
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {values.map((value) => (
          <ValueCard
            key={value.title}
            icon={value.icon}
            title={value.title}
            description={value.description}
          />
        ))}
      </div>
    </section>
  );
}
