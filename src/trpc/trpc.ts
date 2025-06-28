import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { logger } from "../utils/logger";
import {
  extractTokenFromHeader,
  getUserFromToken,
  type AuthContext,
} from "../utils/auth";

// Context type for tRPC
export interface Context {
  req: Request;
  auth?: AuthContext;
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

// Authentication middleware
export const authMiddleware = middleware(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No authentication token provided",
    });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: { user },
    },
  });
});

// Procedure with logging
export const loggedProcedure = publicProcedure.use(loggingMiddleware);

// Protected procedure (requires authentication)
export const protectedProcedure = loggedProcedure.use(authMiddleware);
