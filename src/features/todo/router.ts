import { router, loggedProcedure } from "../../shared/trpc/trpc";
import {
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  ListTodosInputSchema,
  TodoIdSchema,
} from "./schemas";
import { TodoService } from "./service";

export const todoRouter = router({
  // Create a new todo
  create: loggedProcedure.input(CreateTodoInputSchema).mutation(({ input }) => {
    return TodoService.createTodo(input);
  }),

  // Get all todos with filtering
  list: loggedProcedure.input(ListTodosInputSchema).query(({ input }) => {
    return TodoService.listTodos(input);
  }),

  // Get a single todo by ID
  getById: loggedProcedure.input(TodoIdSchema).query(({ input }) => {
    const todo = TodoService.getTodoById(input.id);
    if (!todo) {
      throw new Error("Todo not found");
    }
    return todo;
  }),

  // Update a todo
  update: loggedProcedure.input(UpdateTodoInputSchema).mutation(({ input }) => {
    const todo = TodoService.updateTodo(input);
    if (!todo) {
      throw new Error("Todo not found or update failed");
    }
    return todo;
  }),

  // Delete a todo
  delete: loggedProcedure.input(TodoIdSchema).mutation(({ input }) => {
    const success = TodoService.deleteTodo(input.id);
    return { success, id: input.id };
  }),

  // Get statistics
  getStats: loggedProcedure.query(() => {
    return TodoService.getStats();
  }),
});
