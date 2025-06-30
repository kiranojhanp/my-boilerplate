import { initTRPC } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { logger } from "@/server/shared/utils/logger";

// Context type for tRPC
export interface Context {
  req: Request;
}

// Create the tRPC instance with SuperJSON transformer
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    // Log errors for monitoring
    if (error.code === "INTERNAL_SERVER_ERROR") {
      logger.error("tRPC Internal Server Error:", error);
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Logging middleware
export const loggingMiddleware = middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  const meta = { path, type, durationMs };

  if (result.ok) {
    logger.info(`tRPC ${type} ${path} - ${durationMs}ms`, meta);
  } else {
    logger.error(`tRPC ${type} ${path} - ${durationMs}ms - ERROR`, {
      ...meta,
      error: result.error,
    });
  }

  return result;
});

// Procedure with logging
export const loggedProcedure = publicProcedure.use(loggingMiddleware);
