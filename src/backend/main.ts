import { appRouter } from "@/backend/router";
import { logger } from "@/backend/utils";
import { StaticFileHandler } from "@/backend/static-handler";
import { createBunServeHandler } from "trpc-bun-adapter";
import { initializeDatabase, closeDatabase } from "@/backend/database";
import env from "@/backend/env";

// Initialize database
await initializeDatabase();

// Only build client in production
const isProduction = env.NODE_ENV === "production";
if (isProduction) {
  logger.info("Production mode: Expecting pre-built client in ./dist/web");
} else {
  logger.info(
    "Development mode: Skipping client build, expecting Vite dev server"
  );
}

// Initialize static file handler for production
const staticHandler = isProduction
  ? new StaticFileHandler({ basePath: "./dist/web" })
  : null;

// Create simplified tRPC handler - Bun handles static files automatically
const trpcHandler = createBunServeHandler(
  {
    endpoint: "/trpc",
    router: appRouter,
    // Enable CORS only in development for Vite (production serves from Bun directly)
    responseMeta: !isProduction
      ? (_opts: any) => ({
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": `http://localhost:${env.VITE_PORT}`,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        })
      : undefined,
  },
  {
    port: env.PORT,
    async fetch(request, server) {
      const url = new URL(request.url);

      // Handle static files in production
      if (isProduction && !url.pathname.startsWith("/trpc")) {
        const staticResponse = await staticHandler?.handleRequest(request);
        if (staticResponse) {
          return staticResponse;
        }
      }

      // In development, non-tRPC routes should return 404
      // to let Vite dev server handle them
      if (!url.pathname.startsWith("/trpc")) {
        return new Response(
          "Not found - use Vite dev server for frontend in development",
          { status: 404 }
        );
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

if (isProduction) {
  logger.info(`🌐 Frontend served from: http://localhost:${server.port}`);
  logger.info(`🔒 CORS disabled - serving frontend directly from Bun`);
} else {
  logger.info(
    `⚡ Development mode: Frontend should be served by Vite dev server`
  );
  logger.info(
    `📝 Run 'bun dev' to start both servers on http://localhost:${env.VITE_PORT}`
  );
  logger.info(
    `🔓 CORS enabled for Vite dev server (http://localhost:${env.VITE_PORT})`
  );
}

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
