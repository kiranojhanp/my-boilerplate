import { setupRateLimiting } from "./middleware/rateLimiter";
import { setupMetrics, metricsMiddleware } from "./middleware/metrics";
import { logger } from "./utils/logger";
import { appRouter } from "./trpc/router";
import { createBunServeHandler } from "trpc-bun-adapter";
import type { CreateBunContextOptions } from "trpc-bun-adapter";
import type { Context } from "./trpc/trpc";

// Environment variables with defaults
const PORT = parseInt(process.env.PORT || "3000");
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Initialize metrics
setupMetrics();

// Rate limiter
const rateLimiter = setupRateLimiting();

// Helper function to get client IP
function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const cfConnectingIP = req.headers.get("cf-connecting-ip"); // Cloudflare

  return cfConnectingIP || realIP || forwarded?.split(",")[0] || "unknown";
}

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
      // Apply rate limiting
      try {
        await rateLimiter.consume(getClientIP(req));
      } catch {
        return new Response(
          JSON.stringify({
            error: "Too Many Requests",
            message: "Rate limit exceeded",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": CORS_ORIGIN,
            },
          }
        );
      }

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

      // Handle non-tRPC routes
      if (url.pathname === "/metrics") {
        response = await metricsMiddleware(req);
      } else if (url.pathname === "/" || url.pathname === "/health") {
        // Simple health check for root and /health
        response = new Response(
          JSON.stringify({
            status: "healthy",
            message: "API is running",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            endpoints: {
              trpc: "/trpc",
              metrics: "/metrics",
              docs: "Use tRPC client or call /trpc/[router].[procedure]",
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              // Security headers
              "X-Content-Type-Options": "nosniff",
              "X-Frame-Options": "DENY",
              "X-XSS-Protection": "1; mode=block",
              "Strict-Transport-Security":
                "max-age=31536000; includeSubDomains",
              "Content-Security-Policy": "default-src 'self'",
              "Referrer-Policy": "strict-origin-when-cross-origin",
              "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
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
              metrics: "/metrics",
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
        `${req.method} ${url.pathname} ${response.status} ${duration}ms`,
        {
          method: req.method,
          path: url.pathname,
          status: response.status,
          duration,
          ip: getClientIP(req),
          userAgent: req.headers.get("user-agent"),
        }
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
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
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
logger.info(`📊 Metrics available at http://localhost:${PORT}/metrics`);
logger.info(`🔍 Health check at http://localhost:${PORT}/health`);
logger.info(`⚡ tRPC API at http://localhost:${PORT}/trpc`);
logger.info(`📚 Available procedures:`);
logger.info(`   Hello Router:`);
logger.info(`     - GET  /trpc/hello.hello`);
logger.info(`     - GET  /trpc/hello.helloName?input={"name":"World"}`);
logger.info(`     - POST /trpc/hello.customHello`);
logger.info(`     - GET  /trpc/hello.protectedHello (requires auth)`);
logger.info(`     - GET  /trpc/hello.complexData`);
logger.info(`   Health Router:`);
logger.info(`     - GET  /trpc/health.check`);
logger.info(`     - GET  /trpc/health.ready`);
logger.info(`     - GET  /trpc/health.live`);
logger.info(`   Auth Router:`);
logger.info(`     - POST /trpc/auth.register`);
logger.info(`     - POST /trpc/auth.login`);
logger.info(`     - POST /trpc/auth.refresh`);
logger.info(`     - GET  /trpc/auth.me (requires auth)`);
logger.info(`     - POST /trpc/auth.updateProfile (requires auth)`);
logger.info(`     - POST /trpc/auth.changePassword (requires auth)`);
logger.info(`     - POST /trpc/auth.deleteAccount (requires auth)`);
logger.info(`   Validation Router:`);
logger.info(`     - POST /trpc/validation.validateComplexUser`);
logger.info(`     - POST /trpc/validation.validateFileUpload (requires auth)`);
logger.info(`     - GET  /trpc/validation.validateSearch`);
logger.info(`     - POST /trpc/validation.validateBatchData`);
logger.info(`     - GET  /trpc/validation.validateComplexTypes`);
logger.info(
  `💡 Features: SuperJSON, Zod validation, Bun password hashing, JWT auth, Advanced validation`
);

export default server;
