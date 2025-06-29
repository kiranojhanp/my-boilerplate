import { trpc } from "../../../shared/lib/trpc";
import type {
  TodoFilters,
  CreateTodoData,
  UpdateTodoData,
} from "../../../shared/types/todo";

export function useTodos(filters: TodoFilters = {}) {
  return trpc.todo.list.useQuery({
    ...filters,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    category: filters.category || undefined,
    search: filters.search || undefined,
  });
}

export function useTodoById(id: string) {
  return trpc.todo.getById.useQuery({ id });
}

export function useTodoStats() {
  return trpc.todo.getStats.useQuery();
}

export function useCreateTodo() {
  const utils = trpc.useUtils();

  return trpc.todo.create.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate();
      utils.todo.getStats.invalidate();
    },
  });
}

export function useUpdateTodo() {
  const utils = trpc.useUtils();

  return trpc.todo.update.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate();
      utils.todo.getStats.invalidate();
    },
  });
}

export function useDeleteTodo() {
  const utils = trpc.useUtils();

  return trpc.todo.delete.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate();
      utils.todo.getStats.invalidate();
    },
  });
}
