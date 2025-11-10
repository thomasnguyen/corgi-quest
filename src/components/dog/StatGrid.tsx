import StatOrb from "./StatOrb";
import { DogStat } from "../../lib/types";

interface StatGridProps {
  stats: DogStat[];
}

export default function StatGrid({ stats }: StatGridProps) {
  // Get individual stats by type
  const intStat = stats.find((s) => s.statType === "INT");
  const phyStat = stats.find((s) => s.statType === "PHY");
  const impStat = stats.find((s) => s.statType === "IMP");
  const socStat = stats.find((s) => s.statType === "SOC");

  return (
    <div className="py-4 px-4">
      <div className="flex gap-2 justify-center">
        {intStat && (
          <StatOrb
            statType="INT"
            level={intStat.level}
            xp={intStat.xp}
            xpToNextLevel={intStat.xpToNextLevel}
          />
        )}
        {phyStat && (
          <StatOrb
            statType="PHY"
            level={phyStat.level}
            xp={phyStat.xp}
            xpToNextLevel={phyStat.xpToNextLevel}
          />
        )}
        {impStat && (
          <StatOrb
            statType="IMP"
            level={impStat.level}
            xp={impStat.xp}
            xpToNextLevel={impStat.xpToNextLevel}
          />
        )}
        {socStat && (
          <StatOrb
            statType="SOC"
            level={socStat.level}
            xp={socStat.xp}
            xpToNextLevel={socStat.xpToNextLevel}
          />
        )}
      </div>
    </div>
  );
}
