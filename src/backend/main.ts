import { appRouter } from "@/backend/router";
import { logger } from "@/backend/utils";
import { createBunServeHandler } from "trpc-bun-adapter";
import { initializeDatabase, closeDatabase } from "@/backend/database";

// Helper function to determine content type based on file extension
function getContentType(pathname: string): string {
  const ext = pathname.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
      return "application/javascript";
    case "css":
      return "text/css";
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    case "ttf":
      return "font/ttf";
    case "eot":
      return "application/vnd.ms-fontobject";
    default:
      return "application/octet-stream";
  }
}

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

      // Serve the SPA for all routes that should use client-side routing
      if (
        url.pathname === "/" ||
        url.pathname.startsWith("/todos") ||
        url.pathname.startsWith("/about") ||
        url.pathname.startsWith("/settings")
      ) {
        try {
          return new Response(Bun.file("./dist/web/index.html"), {
            headers: {
              "Content-Type": "text/html",
            },
          });
        } catch (error) {
          logger.error("Error serving HTML:", error);
          return new Response("Error loading page", { status: 500 });
        }
      }

      // Serve static assets from Vite build
      if (url.pathname.startsWith("/assets/")) {
        const filePath = `./dist/web${url.pathname}`;
        try {
          const file = Bun.file(filePath);
          const contentType = getContentType(url.pathname);
          return new Response(file, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000", // 1 year cache for assets
            },
          });
        } catch (error) {
          return new Response("Asset not found", { status: 404 });
        }
      }

      // Serve other static files (favicon, etc.)
      if (
        url.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
      ) {
        const filePath = `./dist/web${url.pathname}`;
        try {
          const file = Bun.file(filePath);
          const contentType = getContentType(url.pathname);
          return new Response(file, {
            headers: {
              "Content-Type": contentType,
            },
          });
        } catch (error) {
          return new Response("File not found", { status: 404 });
        }
      }

      return new Response("Not found", { status: 404 });
    },
  }
);

logger.info("Building client...");
Bun.spawnSync(["bun", "run", "build:all"]);

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
