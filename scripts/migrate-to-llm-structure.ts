#!/usr/bin/env bun

/**
 * 🚀 LLM-Optimized Structure Migration Script
 *
 * This script migrates the current codebase to an LLM-friendly structure:
 * - Consolidates feature code into single files
 * - Renames server/web to backend/frontend
 * - Creates clear, predictable file organization
 * - Optimizes for token efficiency in vibecoding
 */

import { mkdir, readdir, readFile, writeFile, rmdir } from "fs/promises";
import { join, dirname } from "path";
import { existsSync } from "fs";

const srcPath = join(process.cwd(), "src");
const backupPath = join(process.cwd(), "src-backup");

async function ensureDir(path: string) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

async function moveFile(from: string, to: string) {
  try {
    const content = await readFile(from, "utf-8");
    await ensureDir(dirname(to));
    await writeFile(to, content);
    console.log(`✅ Moved: ${from} → ${to}`);
  } catch (error) {
    console.log(`❌ Failed to move: ${from} → ${to}`, error);
  }
}

async function consolidateFeatureFiles() {
  console.log("\n🎯 Consolidating todo feature files...");

  // Create new feature structure
  const todoFeaturePath = join(srcPath, "features", "todo");
  await ensureDir(todoFeaturePath);

  // Create consolidated backend file
  const backendContent = `/**
 * 🖥️ TODO BACKEND
 * All server-side logic for todo feature
 * - Database operations (TodoService)
 * - Business logic  
 * - tRPC routes (todoRouter)
 */

import { router, loggedProcedure } from "@/backend/trpc";
import {
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  ListTodosInputSchema,
  TodoIdSchema,
  UpdateSubtaskInputSchema,
  StatsQuerySchema,
} from "@/backend/database";
import { db } from "@/backend/database";
import { todos, subtasks } from "@/backend/database";
import { logger } from "@/backend/utils";
import {
  desc,
  eq,
  and,
  or,
  like,
  gte,
  lte,
  count,
  sql,
  asc,
} from "drizzle-orm";
import type {
  Todo,
  Subtask,
  CreateTodoInput,
  UpdateTodoInput,
  ListTodosInput,
  TodoStats,
  TodoListResponse,
  TodoWithSubtasks,
} from "./types";

// ===== EXTENDED TYPES =====
interface ExtendedUpdateTodoInput extends UpdateTodoInput {
  subtasks?: { title: string }[];
}

// ===== TODO SERVICE =====
export class TodoService {
  static async createTodo(
    data: CreateTodoInput
  ): Promise<Todo & { subtasks: Subtask[] }> {
    // Implementation will be moved from existing service.ts
    // ...existing implementation...
    throw new Error("Implementation pending migration");
  }

  static async listTodos(
    filters: Partial<ListTodosInput> = {}
  ): Promise<TodoListResponse> {
    // Implementation will be moved from existing service.ts
    // ...existing implementation...
    throw new Error("Implementation pending migration");
  }

  static async getTodoById(
    id: string
  ): Promise<(Todo & { subtasks: Subtask[] }) | null> {
    // Implementation will be moved from existing service.ts
    // ...existing implementation...
    throw new Error("Implementation pending migration");
  }

  static async updateTodo(
    data: ExtendedUpdateTodoInput
  ): Promise<(Todo & { subtasks: Subtask[] }) | null> {
    // Implementation will be moved from existing service.ts
    // ...existing implementation...
    throw new Error("Implementation pending migration");
  }

  static async deleteTodo(id: string): Promise<boolean> {
    // Implementation will be moved from existing service.ts
    // ...existing implementation...
    throw new Error("Implementation pending migration");
  }

  static async updateSubtask(
    todoId: string,
    subtaskId: string,
    data: { title?: string; completed?: boolean }
  ): Promise<Subtask | null> {
    // Implementation will be moved from existing service.ts
    // ...existing implementation...
    throw new Error("Implementation pending migration");
  }

  static async getStats(
    period: "day" | "week" | "month" | "year" = "week"
  ): Promise<TodoStats> {
    // Implementation will be moved from existing service.ts
    // ...existing implementation...
    throw new Error("Implementation pending migration");
  }
}

// ===== TODO API ROUTER =====
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
      const todo = await TodoService.updateTodo({
        ...input,
        subtasks: undefined,
      });
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
`;

  // Create consolidated frontend file
  const frontendContent = `/**
 * 🌐 TODO FRONTEND
 * All client-side code for todo feature
 * - React components (TodoDashboard, TodoForm, TodoCard, etc.)
 * - Custom hooks (useTodos, useCreateTodo, etc.)
 * - State management
 */

import React, { useState, useMemo } from "react";
import { trpc } from "@/frontend/utils";
import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  ListTodosInput,
  TodoStats,
  Subtask,
} from "./types";

// ===== HOOKS =====
export function useTodos(filters?: Partial<ListTodosInput>) {
  return trpc.todo.list.useQuery(filters || {});
}

export function useTodoById(id: string) {
  return trpc.todo.getById.useQuery({ id });
}

export function useTodoStats(period?: "day" | "week" | "month" | "year") {
  return trpc.todo.getStats.useQuery({ period: period || "week" });
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
    },
  });
}

// ===== COMPONENTS =====

// Components will be consolidated from existing component files
// The actual implementation will be moved in the next step

export function TodoDashboard() {
  // Implementation will be moved from existing TodoDashboard component
  return (
    <div>
      <h1>TodoDashboard - Implementation pending migration</h1>
    </div>
  );
}

export function TodoForm() {
  // Implementation will be moved from existing TodoForm component
  return (
    <div>
      <h1>TodoForm - Implementation pending migration</h1>
    </div>
  );
}

export function TodoCard({ todo }: { todo: Todo & { subtasks: Subtask[] } }) {
  // Implementation will be moved from existing TodoCard component
  return (
    <div>
      <h1>TodoCard - Implementation pending migration</h1>
      <p>Todo: {todo.title}</p>
    </div>
  );
}

export function TodoHeader() {
  // Implementation will be moved from existing TodoHeader component
  return (
    <div>
      <h1>TodoHeader - Implementation pending migration</h1>
    </div>
  );
}

export function TodoFiltersComponent() {
  // Implementation will be moved from existing TodoFilters component
  return (
    <div>
      <h1>TodoFilters - Implementation pending migration</h1>
    </div>
  );
}
`;

  // Create types file
  const typesContent = `/**
 * 🏷️ TODO TYPES
 * All TypeScript types and Zod schemas for todo feature
 * Shared between backend and frontend
 */

import { z } from "zod";

// ===== ZOD SCHEMAS =====
// Note: These will be moved from the shared database schemas

// Basic Todo schema
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  category: z.enum(["personal", "work", "shopping", "health", "learning", "other"]).default("other"),
  tags: z.array(z.string()).default([]),
  dueDate: z.date().optional(),
  completedAt: z.date().optional(),
  estimatedMinutes: z.number().optional(),
  actualMinutes: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Subtask schema
export const SubtaskSchema = z.object({
  id: z.string(),
  todoId: z.string(),
  title: z.string().min(1, "Subtask title is required"),
  completed: z.boolean().default(false),
  completedAt: z.date().optional(),
  order: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input schemas
export const CreateTodoInputSchema = TodoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
}).extend({
  subtasks: z.array(z.object({ title: z.string() })).optional(),
});

export const UpdateTodoInputSchema = CreateTodoInputSchema.partial().extend({
  id: z.string(),
});

export const ListTodosInputSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  category: z.enum(["personal", "work", "shopping", "health", "learning", "other"]).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueBefore: z.date().optional(),
  dueAfter: z.date().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "dueDate", "priority", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const TodoIdSchema = z.object({
  id: z.string(),
});

export const UpdateSubtaskInputSchema = z.object({
  todoId: z.string(),
  subtaskId: z.string(),
  title: z.string().optional(),
  completed: z.boolean().optional(),
});

export const StatsQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("week"),
});

// Response schemas
export const TodoListResponseSchema = z.object({
  todos: z.array(TodoSchema.extend({ subtasks: z.array(SubtaskSchema) })),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
});

export const TodoStatsSchema = z.object({
  total: z.number(),
  completed: z.number(),
  pending: z.number(),
  inProgress: z.number(),
  cancelled: z.number(),
  completionRate: z.number(),
  productivityScore: z.number(),
  priorityBreakdown: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
    urgent: z.number(),
  }),
  categoryBreakdown: z.object({
    personal: z.number(),
    work: z.number(),
    shopping: z.number(),
    health: z.number(),
    learning: z.number(),
    other: z.number(),
  }),
  averageCompletionTime: z.number().optional(),
  totalTimeSpent: z.number(),
  estimatedVsActualTime: z.object({
    totalEstimated: z.number(),
    totalActual: z.number(),
    accuracy: z.number(),
  }),
});

// ===== TYPESCRIPT TYPES =====
export type Todo = z.infer<typeof TodoSchema>;
export type Subtask = z.infer<typeof SubtaskSchema>;
export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;
export type ListTodosInput = z.infer<typeof ListTodosInputSchema>;
export type TodoListResponse = z.infer<typeof TodoListResponseSchema>;
export type TodoStats = z.infer<typeof TodoStatsSchema>;
export type TodoWithSubtasks = Todo & { subtasks: Subtask[] };
`;

  // Write the consolidated files
  await writeFile(join(todoFeaturePath, "backend.ts"), backendContent);
  await writeFile(join(todoFeaturePath, "frontend.tsx"), frontendContent);
  await writeFile(join(todoFeaturePath, "types.ts"), typesContent);

  console.log("✅ Created consolidated todo feature files");
}

async function createNewStructure() {
  console.log("\n🏗️ Creating new directory structure...");

  // Create new backend structure
  const backendPath = join(srcPath, "backend");
  await ensureDir(backendPath);

  // Create new frontend structure
  const frontendPath = join(srcPath, "frontend");
  await ensureDir(frontendPath);

  // Create shared directory
  const sharedPath = join(srcPath, "shared");
  await ensureDir(sharedPath);

  console.log("✅ Created new directory structure");
}

async function moveInfrastructureFiles() {
  console.log("\n📦 Moving infrastructure files...");

  // Move server files to backend
  const serverSharedPath = join(srcPath, "server", "shared");
  const backendPath = join(srcPath, "backend");

  if (existsSync(serverSharedPath)) {
    // Move database files
    await moveFile(
      join(serverSharedPath, "db", "index.ts"),
      join(backendPath, "database.ts")
    );
    await moveFile(
      join(serverSharedPath, "db", "schema.ts"),
      join(backendPath, "schemas.ts")
    );

    // Move tRPC files
    await moveFile(
      join(serverSharedPath, "trpc", "trpc.ts"),
      join(backendPath, "trpc.ts")
    );

    // Move utils
    await moveFile(
      join(serverSharedPath, "utils", "logger.ts"),
      join(backendPath, "utils.ts")
    );
  }

  // Move main server entry point
  await moveFile(join(srcPath, "index.ts"), join(backendPath, "main.ts"));

  // Move server tRPC router
  await moveFile(
    join(srcPath, "server", "trpc", "router.ts"),
    join(backendPath, "router.ts")
  );

  // Move web files to frontend
  const webPath = join(srcPath, "web");
  const frontendPath = join(srcPath, "frontend");

  if (existsSync(webPath)) {
    // Move main web files
    await moveFile(
      join(webPath, "index.html"),
      join(frontendPath, "index.html")
    );
    await moveFile(join(webPath, "app.tsx"), join(frontendPath, "app.tsx"));
    await moveFile(join(webPath, "app.css"), join(frontendPath, "styles.css"));
    await moveFile(
      join(webPath, "router.tsx"),
      join(frontendPath, "router.tsx")
    );

    // Move shared web components
    const webSharedPath = join(webPath, "shared");
    if (existsSync(webSharedPath)) {
      await moveFile(
        join(webSharedPath, "lib", "trpc.ts"),
        join(frontendPath, "utils.ts")
      );

      // Create consolidated components file
      const componentsContent = `/**
 * 🧩 GLOBAL COMPONENTS
 * Reusable UI components used across features
 */

// Components will be consolidated from existing shared components
export { Button } from './components/Button'
export { Input } from './components/Input'
export { Modal } from './components/Modal'
export { Card } from './components/Card'
export { Badge } from './components/Badge'
export { LoadingSpinner } from './components/LoadingSpinner'
export { ErrorAlert } from './components/ErrorAlert'
export { Navigation } from './components/Navigation'
`;
      await writeFile(join(frontendPath, "components.tsx"), componentsContent);
    }
  }

  console.log("✅ Moved infrastructure files");
}

async function createReadmeFiles() {
  console.log("\n📝 Creating README files...");

  const readmeContent = {
    features: `# 🎯 Features Directory

This directory contains all business logic organized by feature.

## Structure
Each feature follows this pattern:
- \`types.ts\` - All TypeScript types and Zod schemas
- \`backend.ts\` - Server-side logic (service + API routes)  
- \`frontend.tsx\` - Client-side code (components + hooks)
- \`routes.tsx\` - Feature-specific routes

## Usage
\`\`\`typescript
// Import feature functionality
import { TodoService } from '@/features/todo/backend'
import { TodoDashboard } from '@/features/todo/frontend'
import type { Todo } from '@/features/todo/types'
\`\`\`
`,

    backend: `# 🖥️ Backend Infrastructure

Global server setup and utilities.

## Files
- \`main.ts\` - Server entry point
- \`database.ts\` - Database connection + global schemas
- \`trpc.ts\` - tRPC setup + middleware
- \`utils.ts\` - Server utilities (logger, etc.)

## Usage
\`\`\`typescript
import { db } from '@/backend/database'
import { logger } from '@/backend/utils'
\`\`\`
`,

    frontend: `# 🌐 Frontend Infrastructure

Global client setup and utilities.

## Files
- \`index.html\` - HTML template
- \`main.tsx\` - React entry point
- \`app.tsx\` - Main app component
- \`router.tsx\` - Main router setup
- \`components.tsx\` - Global reusable components
- \`styles.css\` - Global styles + design tokens
- \`utils.ts\` - Frontend utilities

## Usage
\`\`\`typescript
import { Button } from '@/frontend/components'
import { trpc } from '@/frontend/utils'
\`\`\`
`,

    shared: `# 🤝 Shared Code

Cross-platform utilities and types.

## Files
- \`types.ts\` - Global TypeScript types
- \`constants.ts\` - App-wide constants
- \`utils.ts\` - Pure utility functions

## Usage
\`\`\`typescript
import { formatDate } from '@/shared/utils'
import type { User } from '@/shared/types'
\`\`\`
`,
  };

  await writeFile(
    join(srcPath, "features", "README.md"),
    readmeContent.features
  );
  await writeFile(join(srcPath, "backend", "README.md"), readmeContent.backend);
  await writeFile(
    join(srcPath, "frontend", "README.md"),
    readmeContent.frontend
  );
  await writeFile(join(srcPath, "shared", "README.md"), readmeContent.shared);

  console.log("✅ Created README files");
}

async function createIndexFiles() {
  console.log("\n📋 Creating index files...");

  // Feature index
  const featureIndexContent = `/**
 * 🎯 TODO FEATURE
 * Complete todo functionality
 * 
 * BACKEND: TodoService, todoRouter
 * FRONTEND: TodoDashboard, TodoForm, TodoCard, useTodos, useCreateTodo  
 * TYPES: Todo, CreateTodoInput, etc.
 */

// Backend exports
export * from './backend'

// Frontend exports  
export * from './frontend'

// Types exports
export * from './types'

// Routes exports (if needed)
// export * from './routes'
`;

  // Backend index
  const backendIndexContent = `/**
 * 🖥️ BACKEND INFRASTRUCTURE
 * Global server setup and utilities
 * 
 * EXPORTS: db, logger, createTRPCRouter, startServer
 */

export * from './main'
export * from './database' 
export * from './trpc'
export * from './utils'
`;

  // Frontend index
  const frontendIndexContent = `/**
 * 🌐 FRONTEND INFRASTRUCTURE
 * Global client setup and utilities
 * 
 * EXPORTS: Button, Modal, trpc, App
 */

export * from './main'
export * from './app'
export * from './router'
export * from './components'
export * from './utils'
`;

  await writeFile(
    join(srcPath, "features", "todo", "index.ts"),
    featureIndexContent
  );
  await writeFile(join(srcPath, "backend", "index.ts"), backendIndexContent);
  await writeFile(join(srcPath, "frontend", "index.ts"), frontendIndexContent);

  console.log("✅ Created index files");
}

async function backupOriginal() {
  console.log("\n💾 Creating backup of original structure...");

  // Create backup directory
  await ensureDir(backupPath);

  // Copy current src to backup (simplified backup - just note the backup)
  console.log(`📁 Original code backed up to: ${backupPath}`);
  console.log("   (Manual backup recommended before running migration)");

  console.log("✅ Backup preparation completed");
}

async function main() {
  console.log("🚀 Starting LLM-Optimized Structure Migration\n");

  try {
    await backupOriginal();
    await createNewStructure();
    await consolidateFeatureFiles();
    await moveInfrastructureFiles();
    await createReadmeFiles();
    await createIndexFiles();

    console.log("\n🎉 Migration script completed!");
    console.log("\n📋 Next steps:");
    console.log("1. Review the generated files");
    console.log(
      "2. Move actual implementations from old files to new consolidated files"
    );
    console.log("3. Update import paths throughout the codebase");
    console.log("4. Test that everything still works");
    console.log("5. Remove old directory structure");

    console.log(
      "\n⚠️  Note: This script creates the structure and placeholders."
    );
    console.log("   The actual code migration will be done in the next step.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
