import {
  router,
  loggedProcedure,
  protectedProcedure,
} from "../../shared/trpc/trpc";
import {
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  ListTodosInputSchema,
  DeleteTodoInputSchema,
  ToggleTodoStatusInputSchema,
  AddSubtaskInputSchema,
  UpdateSubtaskInputSchema,
  RemoveSubtaskInputSchema,
  BulkUpdateInputSchema,
  GetTodoByIdInputSchema,
} from "./schemas";
import { TodoService } from "./service";

export const todoRouter = router({
  // Create a new todo
  create: protectedProcedure
    .input(CreateTodoInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.createTodo(input, user.id);
    }),

  // Get all todos for the user with filtering
  list: protectedProcedure
    .input(ListTodosInputSchema)
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.listTodos(input, user.id);
    }),

  // Get a single todo by ID
  getById: protectedProcedure
    .input(GetTodoByIdInputSchema)
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.getTodoById(input.id, user.id);
    }),

  // Update a todo
  update: protectedProcedure
    .input(UpdateTodoInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.updateTodo(input, user.id);
    }),

  // Delete a todo
  delete: protectedProcedure
    .input(DeleteTodoInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.deleteTodo(input.id, user.id);
    }),

  // Toggle todo status (complete/incomplete)
  toggleStatus: protectedProcedure
    .input(ToggleTodoStatusInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.toggleTodoStatus(input, user.id);
    }),

  // Subtask management
  addSubtask: protectedProcedure
    .input(AddSubtaskInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.addSubtask(input, user.id);
    }),

  updateSubtask: protectedProcedure
    .input(UpdateSubtaskInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.updateSubtask(input, user.id);
    }),

  removeSubtask: protectedProcedure
    .input(RemoveSubtaskInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.removeSubtask(input, user.id);
    }),

  // Bulk operations
  bulkUpdate: protectedProcedure
    .input(BulkUpdateInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.bulkUpdate(input, user.id);
    }),

  // Analytics and statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.auth;
    return TodoService.getUserStats(user.id);
  }),
});
