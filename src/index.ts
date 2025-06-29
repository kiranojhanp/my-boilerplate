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
  async fetch(req: Request, server) {
    const url = new URL(req.url);
    const startTime = Date.now();

    try {
      // Handle CORS preflight requests
      if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": CORS_ORIGIN,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      let response: Response;

      // Handle routes
      if (url.pathname === "/" || url.pathname === "/health") {
        // Simple health check for root and /health
        response = new Response(
          JSON.stringify({
            status: "healthy",
            message: "Simple Todo API is running",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            endpoints: {
              trpc: "/trpc",
              docs: "Use tRPC client or call /trpc/todo.[procedure]",
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": CORS_ORIGIN,
            },
          }
        );
      } else if (url.pathname.startsWith("/trpc")) {
        // Handle tRPC requests
        response =
          (await trpcHandler.fetch(req, server)) ||
          new Response("Internal Error", { status: 500 });
      } else {
        // 404 for other routes
        response = new Response(
          JSON.stringify({
            error: "Not Found",
            message: "The requested resource was not found",
            availableEndpoints: {
              health: "/health",
              trpc: "/trpc",
            },
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": CORS_ORIGIN,
            },
          }
        );
      }

      // Log request
      const duration = Date.now() - startTime;
      logger.info(
        `${req.method} ${url.pathname} ${response.status} ${duration}ms`
      );

      return response;
    } catch (error) {
      logger.error("Server error:", error);

      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message:
            NODE_ENV === "development" ? String(error) : "Something went wrong",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": CORS_ORIGIN,
          },
        }
      );
    }
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
logger.info(` Health check at http://localhost:${PORT}/health`);
logger.info(`⚡ tRPC API at http://localhost:${PORT}/trpc`);
logger.info(`📚 Available procedures:`);
logger.info(`   Todo Router:`);
logger.info(`     - POST /trpc/todo.create`);
logger.info(`     - GET  /trpc/todo.getById`);
logger.info(`     - GET  /trpc/todo.list`);
logger.info(`     - POST /trpc/todo.update`);
logger.info(`     - POST /trpc/todo.delete`);
logger.info(`     - GET  /trpc/todo.getStats`);
logger.info(
  `💡 Features: Simple todo management with SuperJSON and Zod validation`
);

export default server;
