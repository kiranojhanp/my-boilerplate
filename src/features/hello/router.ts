import {
  router,
  loggedProcedure,
  protectedProcedure,
} from "../../shared/trpc/trpc";
import {
  helloNameInputSchema,
  customHelloInputSchema,
  protectedHelloInputSchema,
  complexDataInputSchema,
} from "./schemas";
import { HelloService } from "./service";

export const helloRouter = router({
  // Simple hello world endpoint
  hello: loggedProcedure.query(() => {
    return HelloService.getBasicHello();
  }),

  // Hello with name parameter
  helloName: loggedProcedure.input(helloNameInputSchema).query(({ input }) => {
    return HelloService.getHelloWithName(input);
  }),

  // Hello with custom message (mutation example)
  customHello: loggedProcedure
    .input(customHelloInputSchema)
    .mutation(({ input }) => {
      return HelloService.createCustomHello(input);
    }),

  // Protected hello - requires authentication
  protectedHello: protectedProcedure
    .input(protectedHelloInputSchema)
    .query(({ ctx, input }) => {
      const { user } = ctx.auth;
      return HelloService.getProtectedHello(input, user);
    }),

  // Advanced example with complex data types
  complexData: loggedProcedure
    .input(complexDataInputSchema)
    .query(({ input }) => {
      return HelloService.getComplexData(input);
    }),
});
