import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { todos, subtasks } from "./schema";

// ========================================
// AUTO-GENERATED SCHEMAS FROM DRIZZLE (WITH TYPE OVERRIDES)
// ========================================

// Auto-generate schemas with manual overrides for fields where drizzle-zod
// doesn't recognize Drizzle's $type<T>() modifiers
// See: /docs/DRIZZLE_ZOD_TYPE_OVERRIDES.md for detailed explanation

export const TodoSelectSchema = createSelectSchema(todos, {
  // Override tags field because drizzle-zod doesn't recognize $type<string[]>() modifier
  // Drizzle schema: text("tags", { mode: "json" }).$type<string[]>()
  tags: z.array(z.string()).nullable().default([]),
});

export const TodoInsertSchema = createInsertSchema(todos, {
  // Override tags field because drizzle-zod doesn't recognize $type<string[]>() modifier
  // Drizzle schema: text("tags", { mode: "json" }).$type<string[]>()
  tags: z.array(z.string()).optional().default([]),
});
export const SubtaskSelectSchema = createSelectSchema(subtasks);
export const SubtaskInsertSchema = createInsertSchema(subtasks);

// ========================================
// AUTO-EXTRACTED ENUM SCHEMAS
// ========================================

// Extract enum schemas from the auto-generated schemas
export const TodoPrioritySchema = TodoSelectSchema.shape.priority;
export const TodoStatusSchema = TodoSelectSchema.shape.status;
export const TodoCategorySchema = TodoSelectSchema.shape.category;

// ========================================
// ENHANCED INPUT SCHEMAS (BUILT ON AUTO-GENERATED BASE)
// ========================================

// Create Todo Input - Enhanced with validation, built on auto-generated base
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

// Update Todo Input - Enhanced with validation, built on auto-generated base
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

// ========================================
// QUERY AND FILTER SCHEMAS
// ========================================

// List todos input schema with filtering and pagination
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

// Statistics query schema
export const StatsQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("week"),
  category: TodoCategorySchema.optional(),
});

// ========================================
// SUBTASK SCHEMAS (BUILT ON AUTO-GENERATED BASE)
// ========================================

// Create Subtask Input - Built on auto-generated base
export const CreateSubtaskInputSchema = SubtaskInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  order: true,
}).extend({
  // Enhanced validation
  title: z
    .string()
    .min(1, "Subtask title required")
    .max(100, "Subtask title too long"),
});

// Update Subtask Input
export const UpdateSubtaskInputSchema = z.object({
  todoId: z.string().min(1, "Todo ID is required"),
  subtaskId: z.string().min(1, "Subtask ID is required"),
  title: z.string().min(1).max(100).optional(),
  completed: z.boolean().optional(),
});

// ========================================
// ID SCHEMAS
// ========================================

export const TodoIdSchema = z.object({
  id: z.string().min(1, "Todo ID is required"),
});

export const SubtaskIdSchema = z.object({
  id: z.string().min(1, "Subtask ID is required"),
});

// ========================================
// COMPOSED SCHEMAS (BUILT ON AUTO-GENERATED BASE)
// ========================================

// Todo with subtasks - Built on auto-generated schemas
export const TodoWithSubtasksSchema = z.object({
  ...TodoSelectSchema.shape,
  subtasks: z.array(SubtaskSelectSchema),
});

// ========================================
// TYPE EXPORTS (FROM AUTO-GENERATED SCHEMAS)
// ========================================

// Base types from auto-generated Drizzle schemas
export type Todo = z.infer<typeof TodoSelectSchema>;
export type Subtask = z.infer<typeof SubtaskSelectSchema>;
export type TodoWithSubtasks = z.infer<typeof TodoWithSubtasksSchema>;

// Input types from enhanced schemas
export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;
export type CreateSubtaskInput = z.infer<typeof CreateSubtaskInputSchema>;
export type UpdateSubtaskInput = z.infer<typeof UpdateSubtaskInputSchema>;

// Query types
export type ListTodosInput = z.infer<typeof ListTodosInputSchema>;
export type TodoId = z.infer<typeof TodoIdSchema>;
export type SubtaskId = z.infer<typeof SubtaskIdSchema>;
export type StatsQuery = z.infer<typeof StatsQuerySchema>;

// Enum types from auto-extracted schemas
export type TodoPriority = z.infer<typeof TodoPrioritySchema>;
export type TodoStatus = z.infer<typeof TodoStatusSchema>;
export type TodoCategory = z.infer<typeof TodoCategorySchema>;

// ========================================
// NON-DATABASE TYPES (MANUAL - BUT USING AUTO-GENERATED ENUMS)
// ========================================

// Statistics types (these remain manual since they're not database entities)
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

// List response type
export type TodoListResponse = {
  todos: TodoWithSubtasks[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

// API response types
export type CreateTodoResponse = TodoWithSubtasks;
export type UpdateTodoResponse = TodoWithSubtasks;
export type DeleteTodoResponse = { success: boolean; id: string };
export type GetTodoResponse = TodoWithSubtasks;
export type ListTodosResponse = TodoListResponse;
export type GetStatsResponse = TodoStats;
