import { logger } from "../utils/logger";
import { recordHttpMetrics } from "../middleware/metrics";

// Simple in-memory request tracking (in production, use Redis or similar)
const requestTracker = new Map<string, { count: number; firstSeen: number }>();

export async function helloRouter(req: Request, url: URL): Promise<Response> {
  const startTime = Date.now();
  const clientIP = getClientIP(req);

  try {
    // Track requests per IP for analytics
    trackRequest(clientIP);

    // Root endpoint
    if (url.pathname === "/" || url.pathname === "/hello") {
      const response = await handleHelloWorld(req, url);

      // Record metrics
      recordHttpMetrics(
        req.method,
        url.pathname,
        response.status,
        Date.now() - startTime
      );

      return response;
    }

    // Personalized hello
    if (url.pathname.startsWith("/hello/")) {
      const name = url.pathname.split("/hello/")[1];
      if (name) {
        const response = await handlePersonalizedHello(req, url, name);

        // Record metrics
        recordHttpMetrics(
          req.method,
          url.pathname,
          response.status,
          Date.now() - startTime
        );

        return response;
      }
    }

    // Hello with query parameters
    if (url.pathname === "/hello" && url.searchParams.has("name")) {
      const name = url.searchParams.get("name")!;
      const response = await handlePersonalizedHello(req, url, name);

      // Record metrics
      recordHttpMetrics(
        req.method,
        url.pathname,
        response.status,
        Date.now() - startTime
      );

      return response;
    }

    // Stats endpoint
    if (url.pathname === "/hello/stats") {
      const response = await handleStats(req, url);

      // Record metrics
      recordHttpMetrics(
        req.method,
        url.pathname,
        response.status,
        Date.now() - startTime
      );

      return response;
    }

    return new Response(JSON.stringify({ error: "Hello endpoint not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Hello router error:", error);

    // Record error metrics
    recordHttpMetrics(req.method, url.pathname, 500, Date.now() - startTime);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message:
          process.env.NODE_ENV === "development"
            ? String(error)
            : "Something went wrong",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function handleHelloWorld(req: Request, url: URL): Promise<Response> {
  const data = {
    message: "Hello, World! 🌍",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    serverInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: Math.round(process.uptime()),
    },
    endpoints: {
      health: "/health",
      personalizedHello: "/hello/{name} or /hello?name={name}",
      stats: "/hello/stats",
      metrics: "/metrics",
    },
    cloudflare: {
      // These headers are set by Cloudflare
      country: req.headers.get("cf-ipcountry") || "unknown",
      ray: req.headers.get("cf-ray") || "unknown",
      datacenter: req.headers.get("cf-colo") || "unknown",
    },
    security: {
      rateLimit: "100 requests per minute",
      cors: "enabled",
      helmet: "security headers applied",
    },
  };

  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300", // Cache for 5 minutes
    },
  });
}

async function handlePersonalizedHello(
  req: Request,
  url: URL,
  name: string
): Promise<Response> {
  // Sanitize name input
  const sanitizedName = sanitizeName(name);

  if (!sanitizedName) {
    return new Response(
      JSON.stringify({
        error: "Invalid name",
        message:
          "Name must contain only letters, numbers, spaces, and basic punctuation",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const data = {
    message: `Hello, ${sanitizedName}! 👋`,
    personalizedFor: sanitizedName,
    timestamp: new Date().toISOString(),
    tips: [
      "Try /health for system status",
      "Check /metrics for monitoring data",
      "Visit /hello/stats for request statistics",
    ],
    cloudflare: {
      country: req.headers.get("cf-ipcountry") || "unknown",
      ray: req.headers.get("cf-ray") || "unknown",
    },
  };

  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60", // Cache for 1 minute
    },
  });
}

async function handleStats(req: Request, url: URL): Promise<Response> {
  const totalRequests = Array.from(requestTracker.values()).reduce(
    (sum, data) => sum + data.count,
    0
  );

  const uniqueClients = requestTracker.size;

  const data = {
    statistics: {
      totalRequests,
      uniqueClients,
      serverUptime: Math.round(process.uptime()),
      memoryUsage: {
        heapUsed:
          Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        heapTotal:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      },
    },
    timestamp: new Date().toISOString(),
    note: "Statistics are reset when the server restarts. In production, use persistent storage.",
  };

  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache", // Don't cache stats
    },
  });
}

// Helper functions
function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const cfConnectingIP = req.headers.get("cf-connecting-ip"); // Cloudflare

  return cfConnectingIP || realIP || forwarded?.split(",")[0] || "unknown";
}

function trackRequest(clientIP: string): void {
  const existing = requestTracker.get(clientIP);
  if (existing) {
    existing.count++;
  } else {
    requestTracker.set(clientIP, {
      count: 1,
      firstSeen: Date.now(),
    });
  }

  // Clean up old entries (older than 1 hour) to prevent memory leaks
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [ip, data] of requestTracker.entries()) {
    if (data.firstSeen < oneHourAgo) {
      requestTracker.delete(ip);
    }
  }
}

function sanitizeName(name: string): string | null {
  if (!name || typeof name !== "string") {
    return null;
  }

  // Remove any potential XSS or injection attempts
  const sanitized = name
    .trim()
    .replace(/[<>\"'&]/g, "") // Remove dangerous characters
    .slice(0, 50); // Limit length

  // Only allow letters, numbers, spaces, and basic punctuation
  const isValid = /^[a-zA-Z0-9\s\-_.!?]+$/.test(sanitized);

  return isValid ? sanitized : null;
}
