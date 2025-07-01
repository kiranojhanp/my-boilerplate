// Import inferred types from server tRPC router
import type { AppRouter } from "@/server/trpc/router";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Infer ALL types from the tRPC router - this is the single source of truth
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Re-export the inferred types for convenience
export type Todo = RouterOutputs["todo"]["getById"];
export type TodoListResponse = RouterOutputs["todo"]["list"];
export type TodoStats = RouterOutputs["todo"]["getStats"];
export type CreateTodoInput = RouterInputs["todo"]["create"];
export type UpdateTodoInput = RouterInputs["todo"]["update"];
export type DeleteTodoInput = RouterInputs["todo"]["delete"];
export type ListTodosInput = RouterInputs["todo"]["list"];
export type UpdateSubtaskInput = RouterInputs["todo"]["updateSubtask"];

// Derived utility types
export type Subtask = Todo["subtasks"][0];
export type TodoPriority = Todo["priority"];
export type TodoStatus = Todo["status"];
export type TodoCategory = Todo["category"];

// UI-specific types
export type TodoFilters = {
  status?: TodoStatus;
  priority?: TodoPriority;
  category?: TodoCategory;
  search?: string;
};
