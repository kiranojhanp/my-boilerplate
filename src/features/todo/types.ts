// Re-export the auto-generated schemas from drizzle-zod
export {
  TodoSelectSchema as TodoSchema,
  SubtaskSelectSchema as SubTaskSchema,
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  UpdateSubtaskInputSchema,
  ListTodosInputSchema,
  TodoIdSchema,
  StatsQuerySchema,
  TodoPrioritySchema as TodoPriority,
  TodoStatusSchema as TodoStatus,
  TodoCategorySchema as TodoCategory,
  TodoWithSubtasksSchema,
} from "@/server/shared/db/zod-schemas";

// Re-export types
export type {
  Todo,
  Subtask as SubTask,
  CreateTodoInput,
  UpdateTodoInput,
  UpdateSubtaskInput,
  ListTodosInput,
  TodoId,
  StatsQuery,
  TodoPriority as TodoPriorityType,
  TodoStatus as TodoStatusType,
  TodoCategory as TodoCategoryType,
  TodoWithSubtasks,
  TodoStats,
  TodoListResponse,
  CreateTodoResponse,
  UpdateTodoResponse,
  DeleteTodoResponse,
  GetTodoResponse,
  ListTodosResponse,
  GetStatsResponse,
} from "@/server/shared/db/zod-schemas";
