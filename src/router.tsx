import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    // Cache routes for 5 minutes - keeps data fresh while allowing instant navigation
    defaultPreloadStaleTime: 5 * 60 * 1000, // 5 minutes in milliseconds
    // Keep routes in memory for 10 minutes even when inactive
    defaultGcTime: 10 * 60 * 1000, // 10 minutes in milliseconds
  })

  return router
}
