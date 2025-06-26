import { serve } from "bun";
import { setupRateLimiting } from "./middleware/rateLimiter";
import { setupMetrics, metricsMiddleware } from "./middleware/metrics";
import { logger } from "./utils/logger";
import { healthRouter } from "./routes/health";
import { helloRouter } from "./routes/hello";

// Environment variables with defaults
const PORT = parseInt(process.env.PORT || "3000");
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Initialize metrics
setupMetrics();

// Rate limiter
const rateLimiter = setupRateLimiting();

// Main server handler
const server = serve({
  port: PORT,
  async fetch(req) {
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

      // Security headers (helmet equivalent)
      const securityHeaders = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      };

      // CORS headers
      const corsHeaders = {
        "Access-Control-Allow-Origin": CORS_ORIGIN,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      };

      // Handle preflight requests
      if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: { ...corsHeaders, ...securityHeaders },
        });
      }

      let response: Response;

      // Route handling
      if (url.pathname.startsWith("/health")) {
        response = await healthRouter(req, url);
      } else if (url.pathname.startsWith("/hello") || url.pathname === "/") {
        response = await helloRouter(req, url);
      } else if (url.pathname === "/metrics") {
        response = await metricsMiddleware(req);
      } else {
        response = new Response(
          JSON.stringify({
            error: "Not Found",
            message: "The requested resource was not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Add headers to response
      const finalHeaders = {
        ...Object.fromEntries(response.headers.entries()),
        ...corsHeaders,
        ...securityHeaders,
      };

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

      return new Response(response.body, {
        status: response.status,
        headers: finalHeaders,
      });
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
            ...Object.fromEntries(
              Object.entries({
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
              })
            ),
          },
        }
      );
    }
  },
});

// Helper function to get client IP
function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const cfConnectingIP = req.headers.get("cf-connecting-ip"); // Cloudflare

  return cfConnectingIP || realIP || forwarded?.split(",")[0] || "unknown";
}

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

export default server;
