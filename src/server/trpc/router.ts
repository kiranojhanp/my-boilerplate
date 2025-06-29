import { router } from "../shared/trpc/trpc";
import { todoRouter } from "../features/todo";

// Main application router
export const appRouter = router({
  todo: todoRouter,
});

// Export the router type for client-side usage
export type AppRouter = typeof appRouter;
