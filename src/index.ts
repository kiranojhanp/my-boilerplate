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

      // Serve the main HTML file
      if (url.pathname === "/") {
        return new Response(Bun.file("./src/web/index.html"), {
          headers: {
            "Content-Type": "text/html",
          },
        });
      }

      // Serve JavaScript files from dist directory
      if (url.pathname.endsWith(".js")) {
        const filePath = `./dist${url.pathname}`;
        try {
          return new Response(Bun.file(filePath), {
            headers: {
              "Content-Type": "application/javascript",
            },
          });
        } catch (error) {
          return new Response("JS file not found", { status: 404 });
        }
      }

      // Serve CSS files from dist directory
      if (url.pathname.endsWith(".css")) {
        const filePath = `./dist${url.pathname}`;
        try {
          return new Response(Bun.file(filePath), {
            headers: {
              "Content-Type": "text/css",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (error) {
          return new Response("CSS file not found", { status: 404 });
        }
      }

      // Serve source maps
      if (url.pathname.endsWith(".js.map")) {
        const filePath = `./dist${url.pathname}`;
        try {
          return new Response(Bun.file(filePath), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          return new Response("Source map not found", { status: 404 });
        }
      }

      return new Response("Not found", { status: 404 });
    },
  }
);

logger.info("Building client...");
Bun.spawnSync(["bun", "run", "build:web"]);

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
