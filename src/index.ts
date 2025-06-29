import { appRouter } from "./server/trpc/router";
import { logger } from "./server/shared/utils/logger";
import { createBunServeHandler } from "trpc-bun-adapter";
import { initializeDatabase, closeDatabase } from "./server/shared/db";

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
      const url = new URL(request.url);

      if (url.pathname === "/app.js") {
        return new Response(Bun.file("./dist/app.js"));
      }

      if (url.pathname === "/app.css") {
        return new Response(Bun.file("./dist/app.css"), {
          headers: {
            "Content-Type": "text/css",
          },
        });
      }

      if (url.pathname === "/") {
        return new Response(Bun.file("./src/web/index.html"));
      }

      return new Response("Not found", { status: 404 });
    },
  }
);

logger.info("Building client...");
Bun.spawnSync(["bun", "build:client"]);

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
