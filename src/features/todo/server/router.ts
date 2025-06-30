import { router, loggedProcedure } from "@/server/shared/trpc/trpc";
import {
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  ListTodosInputSchema,
  TodoIdSchema,
  UpdateSubtaskInputSchema,
  StatsQuerySchema,
} from "@/features/todo/types";
import { TodoService } from "./service";

export const todoRouter = router({
  // Create a new todo
  create: loggedProcedure
    .input(CreateTodoInputSchema)
    .mutation(async ({ input }) => {
      return TodoService.createTodo(input);
    }),

  // Get all todos with filtering
  list: loggedProcedure.input(ListTodosInputSchema).query(async ({ input }) => {
    return TodoService.listTodos(input);
  }),

  // Get a single todo by ID
  getById: loggedProcedure.input(TodoIdSchema).query(async ({ input }) => {
    const todo = await TodoService.getTodoById(input.id);
    if (!todo) {
      throw new Error("Todo not found");
    }
    return todo;
  }),

  // Update a todo
  update: loggedProcedure
    .input(UpdateTodoInputSchema)
    .mutation(async ({ input }) => {
      const todo = await TodoService.updateTodo(input);
      if (!todo) {
        throw new Error("Todo not found or update failed");
      }
      return todo;
    }),

  // Delete a todo
  delete: loggedProcedure.input(TodoIdSchema).mutation(async ({ input }) => {
    const success = await TodoService.deleteTodo(input.id);
    return { success, id: input.id };
  }),

  // Get statistics
  getStats: loggedProcedure.input(StatsQuerySchema).query(async ({ input }) => {
    return TodoService.getStats(input.period);
  }),

  // Update a subtask
  updateSubtask: loggedProcedure
    .input(UpdateSubtaskInputSchema)
    .mutation(async ({ input }) => {
      const subtask = await TodoService.updateSubtask(
        input.todoId,
        input.subtaskId,
        {
          title: input.title,
          completed: input.completed,
        }
      );
      if (!subtask) {
        throw new Error("Subtask not found or update failed");
      }
      return subtask;
    }),
});
