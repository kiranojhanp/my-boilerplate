import { z } from "zod";
import { router, loggedProcedure, protectedProcedure } from "../trpc";

export const helloRouter = router({
  // Simple hello world endpoint
  hello: loggedProcedure.query(() => {
    return {
      message: "Hello World!",
      timestamp: new Date(), // SuperJSON will handle Date serialization
      version: "1.0.0",
      features: new Set(["authentication", "superjson", "zod"]), // SuperJSON handles Set
    };
  }),

  // Hello with name parameter
  helloName: loggedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
      })
    )
    .query(({ input }: { input: { name: string } }) => {
      return {
        message: `Hello, ${input.name}!`,
        timestamp: new Date(),
        name: input.name,
        metadata: new Map<string, any>([
          ["requestTime", new Date()],
          ["nameLength", input.name.length],
          ["greeting", "personalized"],
        ]), // SuperJSON handles Map
      };
    }),

  // Hello with custom message (mutation example)
  customHello: loggedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(500),
        name: z.string().optional(),
      })
    )
    .mutation(({ input }: { input: { message: string; name?: string } }) => {
      const greeting = input.name ? `Hello, ${input.name}!` : "Hello!";
      return {
        message: input.message,
        greeting,
        timestamp: new Date(),
        processed: true,
        tags: new Set(["custom", "mutation"]),
      };
    }),

  // Protected hello - requires authentication
  protectedHello: protectedProcedure
    .input(
      z.object({
        message: z
          .string()
          .optional()
          .default("Hello from protected endpoint!"),
      })
    )
    .query(({ ctx, input }) => {
      const { user } = ctx.auth;

      return {
        message: input.message,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        timestamp: new Date(),
        accessLevel: "authenticated",
        sessionInfo: new Map<string, any>([
          ["userId", user.id],
          ["loginTime", user.createdAt],
          ["lastUpdate", user.updatedAt],
        ]),
      };
    }),

  // Advanced example with complex data types
  complexData: loggedProcedure
    .input(
      z.object({
        includeMetrics: z.boolean().default(false),
      })
    )
    .query(({ input }) => {
      const baseData = {
        message: "Complex data example",
        timestamp: new Date(),
        bigInt: BigInt(123456789012345678901234567890n), // SuperJSON handles BigInt
        regex: /hello-world/gi, // SuperJSON handles RegExp
        undefinedValue: undefined, // SuperJSON preserves undefined
      };

      if (input.includeMetrics) {
        return {
          ...baseData,
          metrics: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            lastChecked: new Date(),
            healthScore: 0.95,
            errors: new Map<string, number>([
              ["total", 0],
              ["lastHour", 0],
              ["critical", 0],
            ]),
          },
        };
      }

      return baseData;
    }),
});
