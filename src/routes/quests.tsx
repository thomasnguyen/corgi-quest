import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/quests")({
  component: QuestsLayout,
});

// Layout component that renders child routes (index or $questId)
function QuestsLayout() {
  return <Outlet />;
}
