import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 5 * 60 * 1000,
    defaultGcTime: 10 * 60 * 1000,
  });

  return router;
};
