// Import inferred types from server tRPC router
import type { AppRouter } from "@/server/trpc/router";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { z } from "zod";
import {
  TodoPriority as TodoPrioritySchema,
  TodoStatus as TodoStatusSchema,
  TodoCategory as TodoCategorySchema,
} from "@/features/todo/types";

// Infer types from the tRPC router
type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

// Export todo-related types inferred from the server
export type Todo = RouterOutputs["todo"]["getById"];
export type TodoListResponse = RouterOutputs["todo"]["list"];
export type TodoStats = RouterOutputs["todo"]["getStats"];

// Input types for mutations
export type CreateTodoInput = RouterInputs["todo"]["create"];
export type UpdateTodoInput = RouterInputs["todo"]["update"];
export type DeleteTodoInput = RouterInputs["todo"]["delete"];
export type ListTodosInput = RouterInputs["todo"]["list"];
export type UpdateSubtaskInput = RouterInputs["todo"]["updateSubtask"];

// Extract enum types from Zod schemas
export type TodoPriority = z.infer<typeof TodoPrioritySchema>;
export type TodoCategory = z.infer<typeof TodoCategorySchema>;
export type TodoStatus = z.infer<typeof TodoStatusSchema>;

// Filters type for the UI
export type TodoFilters = {
  status?: TodoStatus;
  priority?: TodoPriority;
  category?: TodoCategory;
  search?: string;
};

// Subtask type
export type Subtask = Todo["subtasks"][0];
