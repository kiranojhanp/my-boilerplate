// Re-export types from server schemas
export type TodoPriority = "low" | "medium" | "high" | "urgent";
export type TodoStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TodoCategory =
  | "personal"
  | "work"
  | "shopping"
  | "health"
  | "learning"
  | "other";

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: TodoPriority;
  status: TodoStatus;
  category: TodoCategory;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  tags: string[] | null;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  subtasks: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface TodoFilters {
  status?: TodoStatus;
  priority?: TodoPriority;
  category?: TodoCategory;
  search?: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority: TodoPriority;
  category: TodoCategory;
  dueDate?: string;
  tags: string[];
  estimatedMinutes?: number;
  subtasks: { title: string }[];
}

export interface UpdateTodoData {
  id: string;
  title?: string;
  description?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  category?: TodoCategory;
  dueDate?: string;
  tags?: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
}
