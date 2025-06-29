import { logger } from "./shared/utils/logger";
import { appRouter } from "./trpc/router";
import { createBunServeHandler } from "trpc-bun-adapter";
import type { CreateBunContextOptions } from "trpc-bun-adapter";
import type { Context } from "./shared/trpc/trpc";

// Environment variables with defaults
const PORT = parseInt(process.env.PORT || "3000");
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Create context for tRPC
const createContext = (opts: CreateBunContextOptions): Context => ({
  req: opts.req,
});

// Create the tRPC handler
const trpcHandler = createBunServeHandler({
  router: appRouter,
  endpoint: "/trpc",
  createContext,
  onError: ({ error, req }: { error: any; req: Request }) => {
    logger.error("tRPC Error:", {
      error: error.message,
      code: error.code,
      path: new URL(req.url).pathname,
    });
  },
  responseMeta: () => ({
    headers: {
      // CORS headers
      "Access-Control-Allow-Origin": CORS_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  }),
});

// Create the Bun server
const server = Bun.serve({
  port: PORT,
  ...trpcHandler,
  fetch(req) {
    return new Response("Hello world!");
  },
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.stop();
  process.exit(0);
});

logger.info(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);

export default server;
