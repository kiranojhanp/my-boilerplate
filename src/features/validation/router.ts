import {
  router,
  loggedProcedure,
  protectedProcedure,
} from "../../shared/trpc/trpc";
import {
  complexUserSchema,
  fileUploadSchema,
  searchSchema,
  batchDataSchema,
  complexTypesSchema,
} from "./schemas";
import { ValidationService } from "./service";

export const validationRouter = router({
  // Complex user validation demo
  validateComplexUser: loggedProcedure
    .input(complexUserSchema)
    .mutation(async ({ input }) => {
      return ValidationService.validateComplexUser(input);
    }),

  // File upload validation
  validateFileUpload: protectedProcedure
    .input(fileUploadSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return ValidationService.validateFileUpload(input, user);
    }),

  // Advanced search validation
  validateSearch: loggedProcedure
    .input(searchSchema)
    .query(async ({ input }) => {
      return ValidationService.validateSearch(input);
    }),

  // Batch validation demo
  validateBatchData: loggedProcedure
    .input(batchDataSchema)
    .mutation(async ({ input }) => {
      return ValidationService.validateBatchData(input);
    }),

  // Custom validation with SuperJSON complex types
  validateComplexTypes: loggedProcedure
    .input(complexTypesSchema)
    .query(({ input }) => {
      return ValidationService.validateComplexTypes(input);
    }),
});
