import { router, protectedProcedure } from "../../shared/trpc/trpc";
import {
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  ListTodosInputSchema,
  TodoIdSchema,
} from "./schemas";
import { TodoService } from "./service";

export const todoRouter = router({
  // Create a new todo
  create: protectedProcedure
    .input(CreateTodoInputSchema)
    .mutation(({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.createTodo(input, user.id);
    }),

  // Get all todos for the user with filtering
  list: protectedProcedure
    .input(ListTodosInputSchema)
    .query(({ input, ctx }) => {
      const { user } = ctx.auth;
      return TodoService.listTodos(input, user.id);
    }),

  // Get a single todo by ID
  getById: protectedProcedure
    .input(TodoIdSchema)
    .query(({ input, ctx }) => {
      const { user } = ctx.auth;
      const todo = TodoService.getTodoById(input.id, user.id);
      if (!todo) {
        throw new Error("Todo not found");
      }
      return todo;
    }),

  // Update a todo
  update: protectedProcedure
    .input(UpdateTodoInputSchema)
    .mutation(({ input, ctx }) => {
      const { user } = ctx.auth;
      const todo = TodoService.updateTodo(input, user.id);
      if (!todo) {
        throw new Error("Todo not found or update failed");
      }
      return todo;
    }),

  // Delete a todo
  delete: protectedProcedure
    .input(TodoIdSchema)
    .mutation(({ input, ctx }) => {
      const { user } = ctx.auth;
      const success = TodoService.deleteTodo(input.id, user.id);
      return { success, id: input.id };
    }),

  // Get user statistics
  getStats: protectedProcedure.query(({ ctx }) => {
    const { user } = ctx.auth;
    return TodoService.getUserStats(user.id);
  }),
});
