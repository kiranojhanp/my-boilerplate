import { setupRateLimiting } from "./middleware/rateLimiter";
import { setupMetrics, metricsMiddleware } from "./middleware/metrics";
import { logger } from "./utils/logger";
import { appRouter } from "./trpc/router";
import { createBunServeHandler } from "trpc-bun-adapter";
import type { CreateBunContextOptions } from "trpc-bun-adapter";

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
const createContext = (opts: CreateBunContextOptions) => ({
  req: opts.req,
  // Add any context you need here (user, database, etc.)
});

// Create the server using the official trpc-bun-adapter
const server = Bun.serve(
  createBunServeHandler(
    {
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
          // Security headers (helmet equivalent)
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
          "Content-Security-Policy": "default-src 'self'",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
          // CORS headers
          "Access-Control-Allow-Origin": CORS_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      }),
    },
    {
      port: PORT,
      async fetch(req: Request, server: any) {
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
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // Handle CORS preflight requests
          if (req.method === "OPTIONS") {
            return new Response(null, {
              status: 204,
              headers: {
                "Access-Control-Allow-Origin": CORS_ORIGIN,
                "Access-Control-Allow-Methods":
                  "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400",
              },
            });
          }

          let response: Response | undefined;

          // Handle non-tRPC routes
          if (url.pathname === "/metrics") {
            // Keep metrics endpoint separate
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
                headers: { "Content-Type": "application/json" },
              }
            );
          } else {
            // For tRPC routes, let the adapter handle them
            // This will be handled by the tRPC adapter automatically
            return new Response("Not Found", { status: 404 });
          }

          // Log request for non-tRPC routes
          if (response) {
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
          }

          return response;
        } catch (error) {
          logger.error("Server error:", error);

          return new Response(
            JSON.stringify({
              error: "Internal Server Error",
              message:
                NODE_ENV === "development"
                  ? String(error)
                  : "Something went wrong",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
              },
            }
          );
        }
      },
    }
  )
);

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
logger.info(`   - GET  /trpc/hello.hello`);
logger.info(`   - GET  /trpc/hello.helloName?input={"name":"World"}`);
logger.info(`   - POST /trpc/hello.customHello`);
logger.info(`   - GET  /trpc/health.check`);
logger.info(`   - GET  /trpc/health.ready`);
logger.info(`   - GET  /trpc/health.live`);

export default server;
