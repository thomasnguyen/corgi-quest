import { Link } from "@tanstack/react-router";

export default function BottomNav() {
  const tabs = [
    { name: "Overview", path: "/", image: "/overview_menu.svg" },
    { name: "Quests", path: "/quests", image: "/quests_menu.svg" },
    { name: "Activity", path: "/activity", image: "/activity_menu.svg" },
    { name: "BUMI", path: "/bumi", image: "/overview_menu.svg" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t border-[#8392ba]/0 z-30"
      style={{
        background:
          "radial-gradient(ellipse at bottom, rgba(73,46,37,0.8) 0%, rgba(47,33,32,0.8) 25%, rgba(20,19,27,0.8) 50%, rgba(25,31,47,0.8) 100%)",
      }}
    >
      <div className="max-w-md mx-auto flex items-stretch justify-between px-5 py-2.5">
        {tabs.map((tab) => {
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-1 relative group"
            >
              {/* Icon container with diamond shape */}
              <div className="relative">
                <div>
                  {/* Image */}
                  <div className="relative z-10">
                    <img src={tab.image} alt={tab.name} />
                  </div>
                </div>
              </div>

              {/* Label */}
              <span style={{ fontFamily: "serif", color: "#F5C35F" }}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
