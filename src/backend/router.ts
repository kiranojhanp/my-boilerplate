import { publicProcedure, router } from "@/backend/trpc";
import { todoRouter } from "@/features/todo/backend";
import { sleep } from "bun";

// Main application router
export const appRouter = router({
  todo: todoRouter,
  ping: publicProcedure.query(() => {
    return "pong";
  }),

  subscribe: publicProcedure.subscription(async function* () {
    await sleep(1000);
    yield Math.random();
  }),
});

// Export the router type for client-side usage
export type AppRouter = typeof appRouter;
