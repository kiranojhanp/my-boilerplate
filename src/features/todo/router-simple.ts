import { router, protectedProcedure } from "../../shared/trpc/trpc";
import {
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  ListTodosInputSchema,
  TodoIdSchema,
} from "./schemas";
import { todoStore } from "./service";

export const todoRouter = router({
  // Create a new todo
  create: protectedProcedure
    .input(CreateTodoInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return todoStore.createTodo(user.id, input);
    }),

  // Get all todos for the user with filtering
  list: protectedProcedure
    .input(ListTodosInputSchema)
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return todoStore.listTodos(user.id, input);
    }),

  // Get a single todo by ID
  getById: protectedProcedure
    .input(TodoIdSchema)
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const todo = todoStore.getTodoById(input.id, user.id);
      if (!todo) {
        throw new Error("Todo not found");
      }
      return todo;
    }),

  // Update a todo
  update: protectedProcedure
    .input(UpdateTodoInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const todo = todoStore.updateTodo(input.id, user.id, input);
      if (!todo) {
        throw new Error("Todo not found or update failed");
      }
      return todo;
    }),

  // Delete a todo
  delete: protectedProcedure
    .input(TodoIdSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const success = todoStore.deleteTodo(input.id, user.id);
      return { success, id: input.id };
    }),
});
