import { logger } from "../../shared/utils/logger";
import type {
  Todo,
  CreateTodoInput,
  ListTodosInput,
  UpdateTodoInput,
  TodoStats,
} from "./schemas";

// In-memory todo store (replace with database in production)
export class TodoStore {
  private todos: Map<string, Todo> = new Map();
  private userTodos: Map<string, Set<string>> = new Map();

  createTodo(userId: string, data: CreateTodoInput): Todo {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: "pending",
      category: data.category,
      dueDate: data.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      tags: data.tags,
      estimatedMinutes: data.estimatedMinutes,
      subtasks: data.subtasks.map((st) => ({
        id: crypto.randomUUID(),
        title: st.title,
        completed: false,
        createdAt: new Date(),
      })),
    };

    this.todos.set(todo.id, todo);

    if (!this.userTodos.has(userId)) {
      this.userTodos.set(userId, new Set());
    }
    this.userTodos.get(userId)!.add(todo.id);

    logger.info(`Todo created: ${todo.title}`, {
      todoId: todo.id,
      userId,
      priority: todo.priority,
      category: todo.category,
    });

    return todo;
  }

  getTodoById(id: string, userId: string): Todo | null {
    const todo = this.todos.get(id);
    if (!todo || todo.userId !== userId) {
      return null;
    }
    return todo;
  }

  listTodos(
    userId: string,
    filters: ListTodosInput
  ): {
    todos: Todo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } {
    const userTodoIds = this.userTodos.get(userId) || new Set();
    let todos = Array.from(userTodoIds)
      .map((id) => this.todos.get(id)!)
      .filter(Boolean);

    // Apply filters
    if (filters.status) {
      todos = todos.filter((todo) => todo.status === filters.status);
    }

    if (filters.priority) {
      todos = todos.filter((todo) => todo.priority === filters.priority);
    }

    if (filters.category) {
      todos = todos.filter((todo) => todo.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      todos = todos.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          todo.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      todos = todos.filter((todo) =>
        filters.tags!.some((tag) => todo.tags.includes(tag))
      );
    }

    if (filters.dueBefore) {
      todos = todos.filter(
        (todo) => todo.dueDate && todo.dueDate <= filters.dueBefore!
      );
    }

    if (filters.dueAfter) {
      todos = todos.filter(
        (todo) => todo.dueDate && todo.dueDate >= filters.dueAfter!
      );
    }

    // Sort todos
    todos.sort((a, b) => {
      const field = filters.sortBy;
      const order = filters.sortOrder === "asc" ? 1 : -1;

      if (field === "priority") {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * order;
      }

      if (field === "dueDate") {
        const aDate = a.dueDate?.getTime() || 0;
        const bDate = b.dueDate?.getTime() || 0;
        return (aDate - bDate) * order;
      }

      if (field === "title") {
        return a.title.localeCompare(b.title) * order;
      }

      // Default to createdAt or updatedAt
      const aTime = (a[field] as Date).getTime();
      const bTime = (b[field] as Date).getTime();
      return (bTime - aTime) * order;
    });

    const total = todos.length;
    const totalPages = Math.ceil(total / filters.limit);
    const offset = (filters.page - 1) * filters.limit;
    const paginatedTodos = todos.slice(offset, offset + filters.limit);

    return {
      todos: paginatedTodos,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    };
  }

  updateTodo(
    id: string,
    userId: string,
    updates: Partial<UpdateTodoInput>
  ): Todo | null {
    const todo = this.getTodoById(id, userId);
    if (!todo) return null;

    const updatedTodo: Todo = {
      ...todo,
      ...updates,
      updatedAt: new Date(),
      // Handle status change to completed
      ...(updates.status === "completed" ? { completedAt: new Date() } : {}),
    };

    this.todos.set(id, updatedTodo);

    logger.info(`Todo updated: ${todo.title}`, {
      todoId: id,
      userId,
      updates: Object.keys(updates),
    });

    return updatedTodo;
  }

  deleteTodo(id: string, userId: string): boolean {
    const todo = this.getTodoById(id, userId);
    if (!todo) return false;

    this.todos.delete(id);
    this.userTodos.get(userId)?.delete(id);

    logger.info(`Todo deleted: ${todo.title}`, {
      todoId: id,
      userId,
    });

    return true;
  }

  getUserStats(userId: string): TodoStats {
    const userTodoIds = this.userTodos.get(userId) || new Set();
    const todos = Array.from(userTodoIds)
      .map((id) => this.todos.get(id)!)
      .filter(Boolean);

    const now = new Date();
    const overdue = todos.filter(
      (todo) =>
        todo.dueDate && todo.dueDate < now && todo.status !== "completed"
    ).length;

    const byPriority = {
      low: todos.filter((t) => t.priority === "low").length,
      medium: todos.filter((t) => t.priority === "medium").length,
      high: todos.filter((t) => t.priority === "high").length,
      urgent: todos.filter((t) => t.priority === "urgent").length,
    };

    const byCategory: Record<string, number> = {};
    todos.forEach((todo) => {
      byCategory[todo.category] = (byCategory[todo.category] || 0) + 1;
    });

    return {
      total: todos.length,
      pending: todos.filter((t) => t.status === "pending").length,
      inProgress: todos.filter((t) => t.status === "in_progress").length,
      completed: todos.filter((t) => t.status === "completed").length,
      cancelled: todos.filter((t) => t.status === "cancelled").length,
      overdue,
      byPriority,
      byCategory,
    };
  }
}

// Export a singleton instance
export const todoStore = new TodoStore();

// TodoService class for handling business logic
export class TodoService {
  static createTodo(data: CreateTodoInput, userId: string): Todo {
    return todoStore.createTodo(userId, data);
  }

  static listTodos(
    filters: ListTodosInput,
    userId: string
  ): {
    todos: Todo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } {
    return todoStore.listTodos(userId, filters);
  }

  static getTodoById(id: string, userId: string): Todo | null {
    return todoStore.getTodoById(id, userId);
  }

  static updateTodo(data: UpdateTodoInput, userId: string): Todo | null {
    return todoStore.updateTodo(data.id, userId, data);
  }

  static deleteTodo(id: string, userId: string): boolean {
    return todoStore.deleteTodo(id, userId);
  }

  static getUserStats(userId: string): TodoStats {
    return todoStore.getUserStats(userId);
  }
}
