import { z } from "zod";
import { router, loggedProcedure } from "../trpc";

export const helloRouter = router({
  // Simple hello world endpoint
  hello: loggedProcedure.query(() => {
    return {
      message: "Hello World!",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
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
        timestamp: new Date().toISOString(),
        name: input.name,
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
        timestamp: new Date().toISOString(),
        processed: true,
      };
    }),
});
