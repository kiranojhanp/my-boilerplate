import { RateLimiterMemory } from "rate-limiter-flexible";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "60000"
); // 1 minute
const RATE_LIMIT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || "100"
); // 100 requests per minute

export function setupRateLimiting() {
  return new RateLimiterMemory({
    points: RATE_LIMIT_MAX_REQUESTS, // Number of requests
    duration: Math.floor(RATE_LIMIT_WINDOW_MS / 1000), // Per duration in seconds
    blockDuration: Math.floor(RATE_LIMIT_WINDOW_MS / 1000), // Block for duration in seconds
  });
}

// Advanced rate limiting for different endpoints
export class AdvancedRateLimiter {
  private limiters: Map<string, RateLimiterMemory> = new Map();

  constructor() {
    // Different rate limits for different endpoints
    this.limiters.set(
      "default",
      new RateLimiterMemory({
        points: 100, // 100 requests
        duration: 60, // per 60 seconds
        blockDuration: 60, // block for 60 seconds
      })
    );

    this.limiters.set(
      "hello",
      new RateLimiterMemory({
        points: 1000, // 1000 requests (higher limit for main endpoint)
        duration: 60, // per 60 seconds
        blockDuration: 30, // block for 30 seconds
      })
    );

    this.limiters.set(
      "health",
      new RateLimiterMemory({
        points: 200, // 200 requests (health checks)
        duration: 60, // per 60 seconds
        blockDuration: 10, // block for 10 seconds only
      })
    );
  }

  async checkLimit(key: string, endpoint: string = "default"): Promise<void> {
    const limiter =
      this.limiters.get(endpoint) || this.limiters.get("default")!;
    await limiter.consume(key);
  }
}

export const advancedRateLimiter = new AdvancedRateLimiter();
