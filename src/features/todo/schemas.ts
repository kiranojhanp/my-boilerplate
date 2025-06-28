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
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  completed: z.boolean(),
  createdAt: z.date(),
});

// Base Todo schema
export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: TodoPriority,
  status: TodoStatus,
  category: TodoCategory,
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  userId: z.string().uuid(),
  tags: z.array(z.string()),
  estimatedMinutes: z.number().int().positive().optional(),
  actualMinutes: z.number().int().positive().optional(),
  subtasks: z.array(SubTaskSchema),
});

// Input schemas for create operations
export const CreateSubtaskInputSchema = z.object({
  title: z.string().min(1).max(100),
});

export const CreateTodoInputSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .trim(),

  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .transform((val) => val?.trim()),

  priority: TodoPriority.default("medium"),

  category: TodoCategory.default("personal"),

  dueDate: z
    .string()
    .datetime("Invalid date format")
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine(
      (date) => !date || date > new Date(),
      "Due date must be in the future"
    ),

  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .default([])
    .transform((tags) => [
      ...new Set(tags.map((tag) => tag.toLowerCase().trim())),
    ]),

  estimatedMinutes: z
    .number()
    .int("Estimated minutes must be a whole number")
    .min(1, "Estimated minutes must be at least 1")
    .max(10080, "Estimated minutes cannot exceed a week") // 7 days * 24 hours * 60 minutes
    .optional(),

  subtasks: z
    .array(CreateSubtaskInputSchema)
    .max(20, "Maximum 20 subtasks allowed")
    .default([]),
});

// Input schemas for update operations
export const UpdateTodoInputSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),

  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .trim()
    .optional(),

  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .transform((val) => val?.trim()),

  priority: TodoPriority.optional(),

  status: TodoStatus.optional(),

  category: TodoCategory.optional(),

  dueDate: z
    .string()
    .datetime("Invalid date format")
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine(
      (date) => !date || date > new Date(),
      "Due date must be in the future"
    ),

  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .transform((tags) =>
      tags
        ? [...new Set(tags.map((tag) => tag.toLowerCase().trim()))]
        : undefined
    ),

  estimatedMinutes: z
    .number()
    .int("Estimated minutes must be a whole number")
    .min(1, "Estimated minutes must be at least 1")
    .max(10080, "Estimated minutes cannot exceed a week")
    .optional(),

  actualMinutes: z
    .number()
    .int("Actual minutes must be a whole number")
    .min(0, "Actual minutes cannot be negative")
    .max(10080, "Actual minutes cannot exceed a week")
    .optional(),
});

// List/filter schema
export const ListTodosInputSchema = z
  .object({
    status: TodoStatus.optional(),
    priority: TodoPriority.optional(),
    category: TodoCategory.optional(),

    search: z
      .string()
      .max(100, "Search query too long")
      .optional()
      .transform((val) => val?.trim()),

    tags: z
      .array(z.string().min(1).max(50))
      .max(10, "Maximum 10 tags for filtering")
      .optional(),

    dueBefore: z
      .string()
      .datetime("Invalid date format")
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    dueAfter: z
      .string()
      .datetime("Invalid date format")
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    sortBy: z
      .enum(["createdAt", "updatedAt", "dueDate", "priority", "title"])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),

    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  })
  .refine(({ dueAfter, dueBefore }) => {
    if (dueAfter && dueBefore) {
      return dueAfter <= dueBefore;
    }
    return true;
  }, "Due after date must be before due before date");

// Subtask operation schemas
export const CreateSubtaskInputOnTodoSchema = z.object({
  todoId: z.string().uuid("Invalid todo ID"),
  title: z.string().min(1).max(100),
});

export const UpdateSubtaskInputSchema = z.object({
  todoId: z.string().uuid("Invalid todo ID"),
  subtaskId: z.string().uuid("Invalid subtask ID"),
  title: z.string().min(1).max(100).optional(),
  completed: z.boolean().optional(),
});

export const DeleteSubtaskInputSchema = z.object({
  todoId: z.string().uuid("Invalid todo ID"),
  subtaskId: z.string().uuid("Invalid subtask ID"),
});

// ID-only schemas
export const TodoIdSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
});

// Bulk operation schemas
export const BulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  status: TodoStatus,
});

export const BulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
});

// Statistics schema
export const TodoStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  inProgress: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  cancelled: z.number().int().nonnegative(),
  overdue: z.number().int().nonnegative(),
  byPriority: z.object({
    low: z.number().int().nonnegative(),
    medium: z.number().int().nonnegative(),
    high: z.number().int().nonnegative(),
    urgent: z.number().int().nonnegative(),
  }),
  byCategory: z.record(z.string(), z.number().int().nonnegative()),
});

// Additional missing schemas for router operations
export const GetTodoByIdInputSchema = TodoIdSchema;
export const DeleteTodoInputSchema = TodoIdSchema;

export const ToggleTodoStatusInputSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
  status: TodoStatus.optional(), // If not provided, toggle between completed/pending
});

export const AddSubtaskInputSchema = CreateSubtaskInputOnTodoSchema;
export const RemoveSubtaskInputSchema = DeleteSubtaskInputSchema;

export const BulkUpdateInputSchema = z.union([
  BulkUpdateStatusSchema,
  BulkDeleteSchema,
]);

// Infer types from schemas
export type Todo = z.infer<typeof TodoSchema>;
export type SubTask = z.infer<typeof SubTaskSchema>;
export type TodoPriorityType = z.infer<typeof TodoPriority>;
export type TodoStatusType = z.infer<typeof TodoStatus>;
export type TodoCategoryType = z.infer<typeof TodoCategory>;

// Infer types from input schemas
export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;
export type ListTodosInput = z.infer<typeof ListTodosInputSchema>;
export type CreateSubtaskInput = z.infer<typeof CreateSubtaskInputOnTodoSchema>;
export type UpdateSubtaskInput = z.infer<typeof UpdateSubtaskInputSchema>;
export type TodoStats = z.infer<typeof TodoStatsSchema>;
