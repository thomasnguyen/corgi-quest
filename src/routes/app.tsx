import { createFileRoute, Outlet } from "@tanstack/react-router";
import Layout from "../components/layout/Layout";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

// Layout component that wraps all /app/* routes
function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
