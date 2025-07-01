/**
 * 🏷️ TODO TYPES
 * All TypeScript types and Zod schemas for todo feature
 * Shared between backend and frontend
 */

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { todos, subtasks } from "@/backend/schemas";

// ===== AUTO-GENERATED BASE SCHEMAS =====
export const TodoSelectSchema = createSelectSchema(todos, {
  // Override tags field because drizzle-zod doesn't recognize $type<string[]>() modifier
  tags: z.array(z.string()).nullable().default([]),
});

export const TodoInsertSchema = createInsertSchema(todos, {
  // Override tags field because drizzle-zod doesn't recognize $type<string[]>() modifier
  tags: z.array(z.string()).optional().default([]),
});

export const SubtaskSelectSchema = createSelectSchema(subtasks);
export const SubtaskInsertSchema = createInsertSchema(subtasks);

// ===== ENUM SCHEMAS =====
export const TodoPrioritySchema = TodoSelectSchema.shape.priority;
export const TodoStatusSchema = TodoSelectSchema.shape.status;
export const TodoCategorySchema = TodoSelectSchema.shape.category;

// ===== INPUT SCHEMAS =====
export const CreateTodoInputSchema = TodoInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
}).extend({
  // Enhanced validation
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  // Add subtasks as an array of creation inputs
  subtasks: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Subtask title required")
          .max(100, "Subtask title too long"),
      })
    )
    .default([]),
});

export const UpdateTodoInputSchema = TodoSelectSchema.partial()
  .extend({
    id: z.string().min(1, "Todo ID is required"),
    // Enhanced validation for optional fields
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title too long")
      .optional(),
    description: z.string().max(1000, "Description too long").optional(),
  })
  .omit({
    createdAt: true,
    updatedAt: true,
  });

export const ListTodosInputSchema = z.object({
  status: TodoStatusSchema.optional(),
  priority: TodoPrioritySchema.optional(),
  category: TodoCategorySchema.optional(),
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

export const TodoIdSchema = z.object({
  id: z.string().min(1, "Todo ID is required"),
});

export const UpdateSubtaskInputSchema = z.object({
  todoId: z.string().min(1, "Todo ID is required"),
  subtaskId: z.string().min(1, "Subtask ID is required"),
  title: z.string().min(1).max(100).optional(),
  completed: z.boolean().optional(),
});

export const StatsQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("week"),
  category: TodoCategorySchema.optional(),
});

// ===== COMPOSED SCHEMAS =====
export const TodoWithSubtasksSchema = z.object({
  ...TodoSelectSchema.shape,
  subtasks: z.array(SubtaskSelectSchema),
});

// ===== TYPESCRIPT TYPES =====
export type Todo = z.infer<typeof TodoSelectSchema>;
export type Subtask = z.infer<typeof SubtaskSelectSchema>;
export type TodoWithSubtasks = z.infer<typeof TodoWithSubtasksSchema>;

// Input types
export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;
export type ListTodosInput = z.infer<typeof ListTodosInputSchema>;
export type UpdateSubtaskInput = z.infer<typeof UpdateSubtaskInputSchema>;
export type StatsQuery = z.infer<typeof StatsQuerySchema>;

// Enum types
export type TodoPriority = z.infer<typeof TodoPrioritySchema>;
export type TodoStatus = z.infer<typeof TodoStatusSchema>;
export type TodoCategory = z.infer<typeof TodoCategorySchema>;

// Response types
export type TodoStats = {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  cancelled: number;
  overdue: number;
  byPriority: Record<TodoPriority, number>;
  byCategory: Record<TodoCategory, number>;
  averageCompletionTime: number | null;
  productivityScore: number;
};

export type TodoListResponse = {
  todos: TodoWithSubtasks[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};
