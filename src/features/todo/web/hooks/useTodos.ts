import { trpc } from "@/web/shared/lib/trpc";
import type {
  ListTodosInput,
  CreateTodoInput,
  UpdateTodoInput,
  UpdateSubtaskInput,
} from "@/web/shared/types";

export function useTodos(filters: Partial<ListTodosInput> = {}) {
  return trpc.todo.list.useQuery(filters);
}

export function useTodoById(id: string) {
  return trpc.todo.getById.useQuery({ id });
}

export function useTodoStats(
  period: "day" | "week" | "month" | "year" = "week"
) {
  return trpc.todo.getStats.useQuery({ period });
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

export function useUpdateSubtask() {
  const utils = trpc.useUtils();

  return trpc.todo.updateSubtask.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate();
      utils.todo.getStats.invalidate();
    },
  });
}
