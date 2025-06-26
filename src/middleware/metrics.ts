import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";

// Enable default metrics collection
collectDefaultMetrics();

// Custom metrics
export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
});

export const activeConnections = new Gauge({
  name: "active_connections",
  help: "Number of active connections",
});

export const rateLimitHits = new Counter({
  name: "rate_limit_hits_total",
  help: "Total number of rate limit hits",
  labelNames: ["endpoint"],
});

// Initialize metrics
export function setupMetrics() {
  // Clear any existing metrics
  register.clear();

  // Re-register metrics
  register.registerMetric(httpRequestsTotal);
  register.registerMetric(httpRequestDuration);
  register.registerMetric(activeConnections);
  register.registerMetric(rateLimitHits);

  // Re-enable default metrics
  collectDefaultMetrics({ register });
}

// Middleware to collect metrics
export async function metricsMiddleware(req: Request): Promise<Response> {
  if (req.method === "GET") {
    const metrics = await register.metrics();
    return new Response(metrics, {
      headers: {
        "Content-Type": register.contentType,
      },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}

// Helper function to record HTTP metrics
export function recordHttpMetrics(
  method: string,
  route: string,
  statusCode: number,
  duration: number
) {
  httpRequestsTotal.inc({
    method,
    route,
    status_code: statusCode.toString(),
  });

  httpRequestDuration.observe(
    {
      method,
      route,
      status_code: statusCode.toString(),
    },
    duration / 1000 // Convert to seconds
  );
}
