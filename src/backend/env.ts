/**
 * 🔧 Environment Variables Validation
 * Type-safe environment variable schema using Zod
 */

import { z } from "zod";

// Define the schema for all environment variables
const envSchema = z.object({
  // Server configuration
  PORT: z.coerce.number().min(1000).default(3000),
  VITE_PORT: z.coerce.number().min(1000).default(5173),

  // Environment type
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("testing"),
      z.literal("production"),
    ])
    .default("development"),

  // Database (if you add database URL later)
  // DATABASE_URL: z.string().optional(),
});

// Validate process.env against our schema
const env = envSchema.parse(process.env);

// Export the validated environment
export default env;

// Export the type for use in other files
export type Environment = z.infer<typeof envSchema>;
