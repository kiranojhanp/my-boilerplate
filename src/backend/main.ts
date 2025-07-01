import { appRouter } from "@/backend/router";
import { logger } from "@/backend/utils";
import { createBunServeHandler } from "trpc-bun-adapter";
import { initializeDatabase, closeDatabase } from "@/backend/database";

// Initialize database
await initializeDatabase();

// Only build client in production
const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  logger.info("Building client...");
  Bun.spawnSync(["bun", "run", "build:all"]);
} else {
  logger.info(
    "Development mode: Skipping client build, expecting Vite dev server"
  );
}

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
            "Access-Control-Allow-Origin": `http://localhost:${process.env.VITE_PORT || 5173}`,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        })
      : undefined,
  },
  {
    port: process.env.PORT || 3000,
    async fetch(request, server) {
      const url = new URL(request.url);

      // Only serve static files in production
      // In development, Vite dev server handles the frontend
      if (isProduction && !url.pathname.startsWith("/trpc")) {
        const staticFile = Bun.file(
          `./dist/web${url.pathname === "/" ? "/index.html" : url.pathname}`
        );

        if (await staticFile.exists()) {
          return new Response(staticFile);
        }

        // SPA fallback - serve index.html for client-side routing
        return new Response(Bun.file("./dist/web/index.html"));
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
    `📝 Run 'bun run dev:web' to start Vite dev server on http://localhost:${process.env.VITE_PORT || 5173}`
  );
  logger.info(
    `🔓 CORS enabled for Vite dev server (http://localhost:${process.env.VITE_PORT || 5173})`
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
