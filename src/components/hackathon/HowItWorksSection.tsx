import { MessageSquare, Zap, RefreshCw } from "lucide-react";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function Step({ number, title, description, icon }: StepProps) {
  return (
    <div className="flex-1 flex flex-col items-center text-center space-y-4">
      {/* Step number and icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-[#121216] border-2 border-[#f5c35f] flex items-center justify-center">
          <div className="text-[#f5c35f]">{icon}</div>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#f5c35f] flex items-center justify-center">
          <span className="text-[#0a0a0a] font-bold text-sm">{number}</span>
        </div>
      </div>

      {/* Title and description */}
      <div className="space-y-2">
        <h3 className="text-[#feefd0] text-lg font-bold">{title}</h3>
        <p className="text-[#f9dca0] text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Log Session",
      description:
        "Voice or text input captures real training activities during live sessions",
      icon: <MessageSquare size={28} />,
    },
    {
      number: 2,
      title: "OpenAI → XP Engine",
      description:
        "AI parses natural language, extracts activities, and calculates multi-stat XP distribution",
      icon: <Zap size={28} />,
    },
    {
      number: 3,
      title: "Convex Real-Time Sync",
      description:
        "Updates propagate instantly to all connected devices via WebSocket subscriptions",
      icon: <RefreshCw size={28} />,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
          How It Works
        </h2>
        <p className="text-[#f9dca0] text-sm max-w-2xl mx-auto">
          Technical architecture: voice input → AI parsing → real-time sync
        </p>
      </div>

      {/* Steps container - responsive layout */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-6">
        {steps.map((step) => (
          <Step key={step.number} {...step} />
        ))}
      </div>

      {/* Optional: Connection lines between steps on desktop */}
      <div className="hidden md:block relative -mt-4">
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center">
          <div className="w-full max-w-3xl flex justify-between px-20">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-[#f5c35f]/50 to-[#f5c35f]/20" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-[#f5c35f]/20 to-[#f5c35f]/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
