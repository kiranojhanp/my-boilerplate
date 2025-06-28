import { router } from "./trpc";
import { helloRouter } from "./routers/hello";
import { healthRouter } from "./routers/health";
import { authRouter } from "./routers/auth";
import { validationRouter } from "./routers/validation";

// Main application router
export const appRouter = router({
  hello: helloRouter,
  health: healthRouter,
  auth: authRouter,
  validation: validationRouter,
});

// Export the router type for client-side usage
export type AppRouter = typeof appRouter;
