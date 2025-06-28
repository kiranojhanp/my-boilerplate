import { router } from "../shared/trpc/trpc";
import { helloRouter } from "../features/hello";
import { healthRouter } from "../features/health";
import { authRouter } from "../features/auth";
import { validationRouter } from "../features/validation";
// import { todoRouter } from "../features/todo"; // TODO: Fix todo router issues

// Main application router
export const appRouter = router({
  hello: helloRouter,
  health: healthRouter,
  auth: authRouter,
  validation: validationRouter,
  // todo: todoRouter, // TODO: Re-enable after fixing
});

// Export the router type for client-side usage
export type AppRouter = typeof appRouter;
