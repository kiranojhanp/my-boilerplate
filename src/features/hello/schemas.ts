import { z } from "zod";

// Hello router input schemas
export const helloNameInputSchema = z.object({
  name: z.string().min(1).max(100),
});

export const customHelloInputSchema = z.object({
  message: z.string().min(1).max(500),
  name: z.string().optional(),
});

export const protectedHelloInputSchema = z.object({
  message: z.string().optional().default("Hello from protected endpoint!"),
});

export const complexDataInputSchema = z.object({
  includeMetrics: z.boolean().default(false),
});

// Response schemas
export const basicHelloResponseSchema = z.object({
  message: z.string(),
  timestamp: z.date(),
  version: z.string(),
  features: z.set(z.string()),
});

export const helloNameResponseSchema = z.object({
  message: z.string(),
  timestamp: z.date(),
  name: z.string(),
  metadata: z.map(z.string(), z.any()),
});

export const customHelloResponseSchema = z.object({
  message: z.string(),
  greeting: z.string(),
  timestamp: z.date(),
  processed: z.boolean(),
  tags: z.set(z.string()),
});

export const protectedHelloResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }),
  timestamp: z.date(),
  accessLevel: z.string(),
  sessionInfo: z.map(z.string(), z.any()),
});

export const complexDataResponseSchema = z.object({
  message: z.string(),
  timestamp: z.date(),
  bigInt: z.bigint(),
  regex: z.instanceof(RegExp),
  undefinedValue: z.undefined(),
  metrics: z
    .object({
      uptime: z.number(),
      memory: z.any(),
      lastChecked: z.date(),
      healthScore: z.number(),
      errors: z.map(z.string(), z.number()),
    })
    .optional(),
});

// Inferred types
export type HelloNameInput = z.infer<typeof helloNameInputSchema>;
export type CustomHelloInput = z.infer<typeof customHelloInputSchema>;
export type ProtectedHelloInput = z.infer<typeof protectedHelloInputSchema>;
export type ComplexDataInput = z.infer<typeof complexDataInputSchema>;
export type BasicHelloResponse = z.infer<typeof basicHelloResponseSchema>;
export type HelloNameResponse = z.infer<typeof helloNameResponseSchema>;
export type CustomHelloResponse = z.infer<typeof customHelloResponseSchema>;
export type ProtectedHelloResponse = z.infer<
  typeof protectedHelloResponseSchema
>;
export type ComplexDataResponse = z.infer<typeof complexDataResponseSchema>;
