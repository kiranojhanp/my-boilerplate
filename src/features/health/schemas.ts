import { z } from "zod";

// Health check schemas with Zod validation
export const healthCheckSchema = z.object({
  status: z.literal("healthy"),
  timestamp: z.string(),
  uptime: z.number(),
  environment: z.string(),
  version: z.string(),
  memory: z.object({
    rss: z.number(),
    heapTotal: z.number(),
    heapUsed: z.number(),
    external: z.number(),
  }),
});

export const readinessCheckSchema = z.object({
  status: z.literal("ready"),
  timestamp: z.string(),
  checks: z.object({
    database: z.string(),
    cache: z.string(),
  }),
});

export const livenessCheckSchema = z.object({
  status: z.literal("alive"),
  timestamp: z.string(),
});

// Inferred types
export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type ReadinessCheck = z.infer<typeof readinessCheckSchema>;
export type LivenessCheck = z.infer<typeof livenessCheckSchema>;
