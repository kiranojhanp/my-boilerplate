import { logger } from "../utils/logger";

export async function healthRouter(req: Request, url: URL): Promise<Response> {
  const startTime = Date.now();

  try {
    // Basic health check
    if (url.pathname === "/health" || url.pathname === "/health/") {
      const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
        memory: process.memoryUsage(),
        pid: process.pid,
      };

      return new Response(JSON.stringify(healthData, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Readiness probe (for Kubernetes)
    if (url.pathname === "/health/ready") {
      // Add checks for dependencies here (database, external APIs, etc.)
      const isReady = await checkReadiness();

      if (isReady) {
        return new Response(JSON.stringify({ status: "ready" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ status: "not ready" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Liveness probe (for Kubernetes)
    if (url.pathname === "/health/live") {
      return new Response(JSON.stringify({ status: "alive" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Detailed health check
    if (url.pathname === "/health/detailed") {
      const detailedHealth = await getDetailedHealth();

      return new Response(JSON.stringify(detailedHealth, null, 2), {
        status: detailedHealth.overall === "healthy" ? 200 : 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Health endpoint not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error("Health check error:", error);

    return new Response(
      JSON.stringify({
        status: "error",
        message: "Health check failed",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Check if the service is ready to handle requests
async function checkReadiness(): Promise<boolean> {
  try {
    // Add your readiness checks here:
    // - Database connection
    // - External API availability
    // - Required environment variables
    // - File system access

    // For now, we'll just check basic system health
    const memoryUsage = process.memoryUsage();
    const maxMemory = 1024 * 1024 * 1024; // 1GB limit

    if (memoryUsage.heapUsed > maxMemory) {
      logger.warn("Memory usage too high", { memoryUsage });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Readiness check failed:", error);
    return false;
  }
}

// Get detailed health information
async function getDetailedHealth() {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // Convert bytes to MB for readability
  const formatMemory = (bytes: number) =>
    Math.round((bytes / 1024 / 1024) * 100) / 100;

  const checks = {
    memory: {
      status: memoryUsage.heapUsed < 512 * 1024 * 1024 ? "healthy" : "warning", // 512MB threshold
      heapUsed: formatMemory(memoryUsage.heapUsed) + " MB",
      heapTotal: formatMemory(memoryUsage.heapTotal) + " MB",
      external: formatMemory(memoryUsage.external) + " MB",
      rss: formatMemory(memoryUsage.rss) + " MB",
    },
    process: {
      status: "healthy",
      pid: process.pid,
      uptime: Math.round(process.uptime()) + " seconds",
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    },
    environment: {
      status: "healthy",
      nodeEnv: process.env.NODE_ENV || "development",
      port: process.env.PORT || "3000",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    timestamp: new Date().toISOString(),
  };

  // Determine overall health
  const allHealthy = Object.values(checks)
    .filter((check) => typeof check === "object" && "status" in check)
    .every((check) => check.status === "healthy");

  return {
    overall: allHealthy ? "healthy" : "degraded",
    checks,
  };
}
