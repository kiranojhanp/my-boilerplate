import { z } from "zod";

// Todo priority enum
export const TodoPriority = z.enum(["low", "medium", "high", "urgent"]);

// Todo status enum
export const TodoStatus = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

// Todo category enum
export const TodoCategory = z.enum([
  "personal",
  "work",
  "shopping",
  "health",
  "learning",
  "other",
]);

// SubTask schema
export const SubTaskSchema = z.object({
  id: z.string().min(1, "Invalid subtask ID"),
  title: z.string().min(1).max(100),
  completed: z.boolean(),
  createdAt: z.date(),
});

// Base Todo schema
export const TodoSchema = z.object({
  id: z.string().min(1, "Invalid todo ID"),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: TodoPriority,
  status: TodoStatus,
  category: TodoCategory,
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  tags: z.array(z.string()),
  estimatedMinutes: z.number().int().positive().optional(),
  actualMinutes: z.number().int().positive().optional(),
  subtasks: z.array(SubTaskSchema),
});

// Input schemas for create operations
export const CreateTodoInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  priority: TodoPriority.default("medium"),
  category: TodoCategory.default("personal"),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).default([]),
  estimatedMinutes: z.number().int().positive().optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1).max(100),
      })
    )
    .default([]),
});

// Input schemas for update operations
export const UpdateTodoInputSchema = z.object({
  id: z.string().min(1, "Todo ID is required"),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  priority: TodoPriority.optional(),
  status: TodoStatus.optional(),
  category: TodoCategory.optional(),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  actualMinutes: z.number().int().positive().optional(),
});

// Schema for updating subtasks
export const UpdateSubtaskInputSchema = z.object({
  todoId: z.string().min(1, "Todo ID is required"),
  subtaskId: z.string().min(1, "Subtask ID is required"),
  title: z.string().min(1).max(100).optional(),
  completed: z.boolean().optional(),
});

// Schema for listing todos with filters
export const ListTodosInputSchema = z.object({
  status: TodoStatus.optional(),
  priority: TodoPriority.optional(),
  category: TodoCategory.optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueBefore: z.date().optional(),
  dueAfter: z.date().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "dueDate", "priority", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Simple ID schema for operations that just need an ID
export const TodoIdSchema = z.object({
  id: z.string().min(1, "Todo ID is required"),
});

// Statistics query schema
export const StatsQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("week"),
  category: TodoCategory.optional(),
});

// Type exports for TypeScript
export type Todo = z.infer<typeof TodoSchema>;
export type SubTask = z.infer<typeof SubTaskSchema>;
export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;
export type UpdateSubtaskInput = z.infer<typeof UpdateSubtaskInputSchema>;
export type ListTodosInput = z.infer<typeof ListTodosInputSchema>;
export type TodoId = z.infer<typeof TodoIdSchema>;
export type StatsQuery = z.infer<typeof StatsQuerySchema>;
export type TodoPriorityType = z.infer<typeof TodoPriority>;
export type TodoStatusType = z.infer<typeof TodoStatus>;
export type TodoCategoryType = z.infer<typeof TodoCategory>;

// Statistics types
export type TodoStats = {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  cancelled: number;
  byPriority: Record<TodoPriorityType, number>;
  byCategory: Record<TodoCategoryType, number>;
  averageCompletionTime: number | null;
  productivityScore: number;
};

// List response type
export type TodoListResponse = {
  todos: Todo[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

// API response types
export type CreateTodoResponse = Todo;
export type UpdateTodoResponse = Todo;
export type DeleteTodoResponse = { success: boolean; id: string };
export type GetTodoResponse = Todo;
export type ListTodosResponse = TodoListResponse;
export type GetStatsResponse = TodoStats;
