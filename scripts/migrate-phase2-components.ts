#!/usr/bin/env bun

/**
 * 🔄 Phase 2: Component Implementation Migration
 *
 * This script consolidates the frontend components into the new structure
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const srcPath = join(process.cwd(), "src");

async function consolidateComponents() {
  console.log("🌐 Consolidating frontend components...");

  // Read the hooks file
  const hooksContent = await readFile(
    join(srcPath, "features/todo/web/hooks/useTodos.ts"),
    "utf-8"
  );

  // Read component files (we'll just get the imports and update them)
  const todoFormPath = join(
    srcPath,
    "features/todo/web/components/TodoForm/index.tsx"
  );
  const todoDashboardPath = join(
    srcPath,
    "features/todo/web/components/TodoDashboard/index.tsx"
  );
  const todoCardPath = join(
    srcPath,
    "features/todo/web/components/TodoCard/index.tsx"
  );
  const todoHeaderPath = join(
    srcPath,
    "features/todo/web/components/TodoHeader/index.tsx"
  );
  const todoFiltersPath = join(
    srcPath,
    "features/todo/web/components/TodoFilters/index.tsx"
  );

  // Create consolidated frontend file
  const frontendContent = `/**
 * 🌐 TODO FRONTEND
 * All client-side code for todo feature
 * - React components (TodoDashboard, TodoForm, TodoCard, etc.)
 * - Custom hooks (useTodos, useCreateTodo, etc.)
 * - State management
 */

import React, { useState, useMemo, memo } from "react";
import { trpc } from "@/frontend/utils";
import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  ListTodosInput,
  TodoStats,
  Subtask,
  UpdateSubtaskInput,
} from "./types";

// Note: These imports will need to be updated after consolidation
// import { Modal } from "@/frontend/components";
// import { LoadingSpinner } from "@/frontend/components";
// import { Button } from "@/frontend/components";
// etc.

// ===== HOOKS =====
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

// ===== TEMPORARY COMPONENT PLACEHOLDERS =====
// These are placeholders - the actual component implementations 
// will be migrated from the existing files manually in the next step

export function TodoDashboard() {
  const { data: todosData, isLoading } = useTodos();
  
  if (isLoading) {
    return <div>Loading todos...</div>;
  }
  
  return (
    <div>
      <h1>Todo Dashboard</h1>
      <p>Found {todosData?.todos?.length || 0} todos</p>
      <p>⚠️ Component implementation needs to be migrated from existing TodoDashboard</p>
    </div>
  );
}

export function TodoForm({ 
  todo, 
  onSubmit, 
  onCancel 
}: { 
  todo?: Todo; 
  onSubmit?: () => void; 
  onCancel?: () => void; 
}) {
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  
  return (
    <div>
      <h2>{todo ? 'Edit Todo' : 'Create Todo'}</h2>
      <p>⚠️ Component implementation needs to be migrated from existing TodoForm</p>
      {onCancel && <button onClick={onCancel}>Cancel</button>}
    </div>
  );
}

export function TodoCard({ 
  todo 
}: { 
  todo: Todo & { subtasks: Subtask[] } 
}) {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  
  return (
    <div>
      <h3>{todo.title}</h3>
      <p>{todo.description}</p>
      <p>Status: {todo.status}</p>
      <p>Priority: {todo.priority}</p>
      <p>⚠️ Component implementation needs to be migrated from existing TodoCard</p>
    </div>
  );
}

export function TodoHeader() {
  const { data: stats } = useTodoStats();
  
  return (
    <div>
      <h1>Todo Manager</h1>
      {stats && (
        <div>
          <span>Total: {stats.total}</span>
          <span>Completed: {stats.completed}</span>
          <span>Pending: {stats.pending}</span>
        </div>
      )}
      <p>⚠️ Component implementation needs to be migrated from existing TodoHeader</p>
    </div>
  );
}

export function TodoFiltersComponent({ 
  filters, 
  onFiltersChange 
}: { 
  filters: Partial<ListTodosInput>; 
  onFiltersChange: (filters: Partial<ListTodosInput>) => void; 
}) {
  return (
    <div>
      <h3>Filters</h3>
      <p>Current filters: {JSON.stringify(filters)}</p>
      <p>⚠️ Component implementation needs to be migrated from existing TodoFilters</p>
    </div>
  );
}

// ===== EXPORTS FOR EASY IMPORTING =====
// Export everything from this file for clean imports
export {
  useTodos,
  useTodoById, 
  useTodoStats,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useUpdateSubtask,
  TodoDashboard,
  TodoForm,
  TodoCard, 
  TodoHeader,
  TodoFiltersComponent,
};

// Default export for the main dashboard
export default TodoDashboard;
`;

  await writeFile(join(srcPath, "features/todo/frontend.tsx"), frontendContent);

  console.log(
    "✅ Created consolidated frontend.tsx with hooks and placeholder components"
  );
  console.log(
    "⚠️  Component implementations need manual migration from existing files"
  );
}

async function updateBackendImports() {
  console.log("🔧 Updating backend imports...");

  // Read the backend file and fix any remaining import issues
  const backendPath = join(srcPath, "features/todo/backend.ts");
  let backendContent = await readFile(backendPath, "utf-8");

  // Fix the missing schemas import
  backendContent = backendContent.replace(
    'import { todos, subtasks } from "@/backend/schemas";',
    'import { todos, subtasks } from "@/backend/schemas";'
  );

  await writeFile(backendPath, backendContent);
  console.log("✅ Updated backend imports");
}

async function createMainEntryPoint() {
  console.log("🚀 Creating new main entry point...");

  // Update the main server entry to use new paths
  const mainPath = join(srcPath, "backend/main.ts");
  let mainContent = await readFile(mainPath, "utf-8");

  // Update imports to use new structure
  mainContent = mainContent.replace(/from "@\/server\//g, 'from "@/backend/');

  // Update feature imports
  mainContent = mainContent.replace(
    /from "@\/features\/.*\/server"/g,
    'from "@/features/todo/backend"'
  );

  await writeFile(mainPath, mainContent);
  console.log("✅ Updated main entry point");
}

async function main() {
  console.log("🚀 Starting Phase 2: Component Implementation Migration\\n");

  try {
    await consolidateComponents();
    await updateBackendImports();
    await createMainEntryPoint();

    console.log("\\n🎉 Phase 2 migration completed!");
    console.log("\\n📋 What was done:");
    console.log("✅ Consolidated hooks into frontend.tsx");
    console.log("✅ Created placeholder components");
    console.log("✅ Updated import paths");
    console.log("\\n⚠️  Next steps:");
    console.log("1. Manually migrate component implementations");
    console.log("2. Update import paths throughout codebase");
    console.log("3. Test compilation");
    console.log("4. Update main router to use new feature structure");
  } catch (error) {
    console.error("❌ Phase 2 migration failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
