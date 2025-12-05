import { Code, Database, Zap, Sparkles, Eye, Globe, Image } from "lucide-react";

interface TechLogo {
  name: string;
  icon: React.ReactNode;
  category: "kiro" | "backend" | "ai" | "frontend";
  description: string;
}

export function TechStackSection() {
  const techStack: TechLogo[] = [
    {
      name: "Kiro",
      icon: <Code className="w-8 h-8" />,
      category: "kiro",
      description: "AI IDE for specs, steering, hooks, and vibe coding",
    },
    {
      name: "Convex",
      icon: <Database className="w-8 h-8" />,
      category: "backend",
      description: "Real-time database and sync",
    },
    {
      name: "OpenAI",
      icon: <Zap className="w-8 h-8" />,
      category: "ai",
      description: "Voice parsing and coaching",
    },
    {
      name: "TanStack",
      icon: <Code className="w-8 h-8" />,
      category: "frontend",
      description: "Full-stack React framework",
    },
    {
      name: "visionOS",
      icon: <Eye className="w-8 h-8" />,
      category: "frontend",
      description: "Vision Pro training HUD",
    },
    {
      name: "Firecrawl",
      icon: <Globe className="w-8 h-8" />,
      category: "ai",
      description: "Quest recommendation scraping",
    },
    {
      name: "DALL·E",
      icon: <Image className="w-8 h-8" />,
      category: "ai",
      description: "AI-generated cosmetics",
    },
  ];

  const kiroFeatures = [
    "Specs - Feature design and planning",
    "Steering - Project context and guidelines",
    "Hooks - Automated workflows and documentation",
    "Vibe Coding - AI-assisted development",
  ];

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent">
          Tech Stack
        </h2>
        <p className="text-[#f9dca0] text-lg">
          Built with cutting-edge tools and AI integration
        </p>
      </div>

      {/* Kiro Highlight Section */}
      <div className="bg-[#121216] border-2 border-[#f5c35f] rounded-lg p-6 space-y-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5c35f]/5 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#f5c35f]/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-[#f5c35f]" />
            </div>
            <h3 className="text-2xl font-bold text-[#feefd0]">
              Powered by Kiro
            </h3>
          </div>

          <ul className="space-y-2">
            {kiroFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-[#f9dca0]">
                <span className="text-[#f5c35f] mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tech Logos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {techStack.map((tech) => (
          <div
            key={tech.name}
            className={`
              p-4 rounded-lg border transition-all duration-200 hover:scale-105
              ${
                tech.category === "kiro"
                  ? "bg-[#f5c35f]/5 border-[#f5c35f]/30 hover:border-[#f5c35f]/50"
                  : "bg-[#121216] border-[#f5c35f]/10 hover:border-[#f5c35f]/20"
              }
            `}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div
                className={`
                ${tech.category === "kiro" ? "text-[#f5c35f]" : "text-[#fcd587]"}
              `}
              >
                {tech.icon}
              </div>
              <h4
                className={`
                font-bold
                ${tech.category === "kiro" ? "text-[#f5c35f]" : "text-[#feefd0]"}
              `}
              >
                {tech.name}
              </h4>
              <p className="text-sm text-[#f9dca0]/80">{tech.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f5c35f]" />
          <span className="text-[#f9dca0]">Kiro Integration</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#fcd587]" />
          <span className="text-[#f9dca0]">Backend & AI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#fcd587]" />
          <span className="text-[#f9dca0]">Frontend</span>
        </div>
      </div>
    </section>
  );
}
