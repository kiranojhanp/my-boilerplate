import { appRouter } from "@/backend/router";
import { logger } from "@/backend/utils";
import { createBunServeHandler } from "trpc-bun-adapter";
import { initializeDatabase, closeDatabase } from "@/backend/database";

// Initialize database
await initializeDatabase();

// Build client
logger.info("Building client...");
Bun.spawnSync(["bun", "run", "build:all"]);

// Create simplified tRPC handler - Bun handles static files automatically
const trpcHandler = createBunServeHandler(
  {
    endpoint: "/trpc",
    router: appRouter,
  },
  {
    port: process.env.PORT || 3000,
    async fetch(request, server) {
      const url = new URL(request.url);

      // Serve static files from dist/web
      if (!url.pathname.startsWith("/trpc")) {
        const staticFile = Bun.file(
          `./dist/web${url.pathname === "/" ? "/index.html" : url.pathname}`
        );

        if (await staticFile.exists()) {
          return new Response(staticFile);
        }

        // SPA fallback - serve index.html for client-side routing
        return new Response(Bun.file("./dist/web/index.html"));
      }

      // Let tRPC handler deal with API routes
      return new Response("Not found", { status: 404 });
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
