import { appRouter } from "./trpc/router";
import { logger } from "./shared/utils/logger";
import { createBunServeHandler } from "trpc-bun-adapter";
import { initializeDatabase, closeDatabase } from "./shared/db/index";

// Initialize database
await initializeDatabase();

// Create tRPC handler for Bun
const trpcHandler = createBunServeHandler(
  {
    endpoint: "/trpc",
    router: appRouter,
  },
  {
    port: process.env.PORT || 3000,
    async fetch(request, server) {
      return new Response("Hello world");
    },
  }
);

// Start server
const server = Bun.serve(trpcHandler);

logger.info(`🚀 Server running on http://localhost:${server.port}`);
logger.info(`📡 tRPC endpoint: http://localhost:${server.port}/trpc`);
logger.info(`🔌 WebSocket subscriptions: ws://localhost:${server.port}/trpc`);

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Received SIGINT, shutting down gracefully...");
  closeDatabase();
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down gracefully...");
  closeDatabase();
  server.stop();
  process.exit(0);
});

export default server;
