import { router } from "./trpc";
import { helloRouter } from "./routers/hello";
import { healthRouter } from "./routers/health";

// Main application router
export const appRouter = router({
  hello: helloRouter,
  health: healthRouter,
});

// Export the router type for client-side usage
export type AppRouter = typeof appRouter;
