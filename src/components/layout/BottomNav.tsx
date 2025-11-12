import { Link, useRouterState } from "@tanstack/react-router";
import { OverviewIcon, QuestsIcon, ActivityIcon } from "../icons/MenuIcons";

export default function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const tabs = [
    { name: "Overview", path: "/", Icon: OverviewIcon },
    { name: "Quests", path: "/quests", Icon: QuestsIcon },
    { name: "Activity", path: "/activity", Icon: ActivityIcon },
    { name: "BUMI", path: "/bumi", Icon: OverviewIcon },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t border-[#8392ba]/0 z-30"
      style={{
        background:
          "radial-gradient(ellipse at bottom, rgba(73,46,37,0.8) 0%, rgba(47,33,32,0.8) 25%, rgba(20,19,27,0.8) 50%, rgba(25,31,47,0.8) 100%)",
      }}
    >
      <div className="max-w-md mx-auto flex items-stretch justify-between px-5 py-4 pb-6">
        {tabs.map((tab) => {
          // For root path, only match exactly
          // For other paths, match if current path starts with the tab path
          const isActive = tab.path === "/" 
            ? currentPath === "/"
            : currentPath === tab.path || currentPath.startsWith(`${tab.path}/`);
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-1 relative group"
            >
              {/* Icon container with diamond shape */}
              <div className="relative">
                <div>
                  {/* Inline SVG Icon - no HTTP request needed */}
                  <div 
                    className="relative z-10 transition-all duration-300"
                    style={{
                      filter: isActive 
                        ? "drop-shadow(0 0 8px rgba(245, 195, 95, 0.8)) drop-shadow(0 0 12px rgba(245, 195, 95, 0.6)) drop-shadow(0 0 16px rgba(245, 195, 95, 0.4))"
                        : "drop-shadow(0 0 0px rgba(245, 195, 95, 0))",
                    }}
                  >
                    <tab.Icon className="w-[53px] h-[53px]" />
                  </div>
                </div>
              </div>

              {/* Label */}
              <span 
                className="transition-all duration-300"
                style={{ 
                  color: "#F5C35F",
                  textShadow: isActive 
                    ? "0 0 8px rgba(245, 195, 95, 0.8), 0 0 12px rgba(245, 195, 95, 0.6)"
                    : "none",
                }}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
