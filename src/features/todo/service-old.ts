import { logger } from "../../shared/utils/logger";
import type {
  Todo,
  CreateTodoInput,
  ListTodosInput,
  CreateSubtaskInput,
  UpdateSubtaskInput,
  TodoStats,
} from "./schemas";
import { BunCryptoUtils } from "../auth/service";

// In-memory todo store (replace with database in production)
export class TodoStore {
  private todos: Map<string, Todo> = new Map();
  private userTodos: Map<string, Set<string>> = new Map();

  async createTodo(userId: string, data: CreateTodoInput): Promise<Todo> {
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

  async getTodoById(id: string, userId: string): Promise<Todo | null> {
    const todo = this.todos.get(id);
    if (!todo || todo.userId !== userId) {
      return null;
    }
    return todo;
  }

  async updateTodo(
    id: string,
    userId: string,
    updates: Partial<Todo>
  ): Promise<Todo | null> {
    const todo = await this.getTodoById(id, userId);
    if (!todo) return null;

    const updatedTodo = {
      ...todo,
      ...updates,
      updatedAt: new Date(),
      // Set completedAt when status changes to completed
      completedAt:
        updates.status === "completed" && todo.status !== "completed"
          ? new Date()
          : todo.completedAt,
    };

    this.todos.set(id, updatedTodo);

    logger.info(`Todo updated: ${updatedTodo.title}`, {
      todoId: id,
      userId,
      changes: Object.keys(updates),
    });

    return updatedTodo;
  }

  async deleteTodo(id: string, userId: string): Promise<boolean> {
    const todo = await this.getTodoById(id, userId);
    if (!todo) return false;

    this.todos.delete(id);
    this.userTodos.get(userId)?.delete(id);

    logger.info(`Todo deleted: ${todo.title}`, { todoId: id, userId });

    return true;
  }

  async listTodos(
    userId: string,
    filters: ListTodosInput
  ): Promise<{
    todos: Todo[];
    total: number;
    page: number;
    totalPages: number;
  }> {
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
        filters.tags!.some((tag: string) =>
          todo.tags.includes(tag.toLowerCase())
        )
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

    // Apply sorting
    todos.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "dueDate":
          aValue = a.dueDate?.getTime() || Infinity;
          bValue = b.dueDate?.getTime() || Infinity;
          break;
        case "updatedAt":
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (filters.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
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

  async addSubtask(
    todoId: string,
    userId: string,
    data: CreateSubtaskInput
  ): Promise<Todo | null> {
    const todo = await this.getTodoById(todoId, userId);
    if (!todo) return null;

    const newSubtask = {
      id: crypto.randomUUID(),
      title: data.title,
      completed: false,
      createdAt: new Date(),
    };

    const updatedTodo = {
      ...todo,
      subtasks: [...todo.subtasks, newSubtask],
      updatedAt: new Date(),
    };

    this.todos.set(todoId, updatedTodo);

    logger.info(`Subtask added to todo: ${todo.title}`, {
      todoId,
      subtaskId: newSubtask.id,
      userId,
    });

    return updatedTodo;
  }

  async updateSubtask(
    todoId: string,
    subtaskId: string,
    userId: string,
    updates: UpdateSubtaskInput
  ): Promise<Todo | null> {
    const todo = await this.getTodoById(todoId, userId);
    if (!todo) return null;

    const subtaskIndex = todo.subtasks.findIndex((st) => st.id === subtaskId);
    if (subtaskIndex === -1) return null;

    const updatedSubtasks = [...todo.subtasks];
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.completed !== undefined
        ? { completed: updates.completed }
        : {}),
    };

    const updatedTodo = {
      ...todo,
      subtasks: updatedSubtasks,
      updatedAt: new Date(),
    };

    this.todos.set(todoId, updatedTodo);

    logger.info(`Subtask updated in todo: ${todo.title}`, {
      todoId,
      subtaskId,
      userId,
    });

    return updatedTodo;
  }

  async deleteSubtask(
    todoId: string,
    subtaskId: string,
    userId: string
  ): Promise<Todo | null> {
    const todo = await this.getTodoById(todoId, userId);
    if (!todo) return null;

    const updatedSubtasks = todo.subtasks.filter((st) => st.id !== subtaskId);

    const updatedTodo = {
      ...todo,
      subtasks: updatedSubtasks,
      updatedAt: new Date(),
    };

    this.todos.set(todoId, updatedTodo);

    logger.info(`Subtask deleted from todo: ${todo.title}`, {
      todoId,
      subtaskId,
      userId,
    });

    return updatedTodo;
  }

  async removeSubtask(
    todoId: string,
    userId: string,
    subtaskId: string
  ): Promise<Todo | null> {
    return this.deleteSubtask(todoId, subtaskId, userId);
  }

  async getTodoStats(userId: string): Promise<TodoStats> {
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

  // Bulk operations
  async bulkUpdateStatus(
    ids: string[],
    status: string,
    userId: string
  ): Promise<{ updated: number; failed: string[] }> {
    let updated = 0;
    const failed: string[] = [];

    for (const id of ids) {
      const todo = await this.getTodoById(id, userId);
      if (todo) {
        await this.updateTodo(id, userId, { status: status as any });
        updated++;
      } else {
        failed.push(id);
      }
    }

    logger.info(`Bulk status update completed`, {
      userId,
      updated,
      failed: failed.length,
      status,
    });

    return { updated, failed };
  }

  async bulkDelete(
    ids: string[],
    userId: string
  ): Promise<{ deleted: number; failed: string[] }> {
    let deleted = 0;
    const failed: string[] = [];

    for (const id of ids) {
      const success = await this.deleteTodo(id, userId);
      if (success) {
        deleted++;
      } else {
        failed.push(id);
      }
    }

    logger.info(`Bulk delete completed`, {
      userId,
      deleted,
      failed: failed.length,
    });

    return { deleted, failed };
  }
}

// Export a singleton instance
export const todoStore = new TodoStore();

// TodoService class for handling business logic
export class TodoService {
  static async createTodo(data: CreateTodoInput, userId: string): Promise<Todo> {
    return todoStore.createTodo(userId, data);
  }

  static async listTodos(filters: ListTodosInput, userId: string): Promise<{
    todos: Todo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = todoStore.listTodos(userId, filters);
    return {
      ...result,
      limit: filters.limit,
    };
  }

  static async getTodoById(id: string, userId: string): Promise<Todo | null> {
    return todoStore.getTodoById(id, userId);
  }

  static async updateTodo(data: any, userId: string): Promise<Todo | null> {
    return todoStore.updateTodo(data.id, userId, data);
  }

  static async deleteTodo(id: string, userId: string): Promise<boolean> {
    return todoStore.deleteTodo(id, userId);
  }

  static async toggleTodoStatus(data: any, userId: string): Promise<Todo | null> {
    const todo = todoStore.getTodoById(data.id, userId);
    if (!todo) {
      return null;
    }
    const newStatus = todo.status === "completed" ? "pending" : "completed";
    return todoStore.updateTodo(data.id, userId, { status: newStatus });
  }

  static async addSubtask(data: any, userId: string): Promise<Todo | null> {
    return todoStore.addSubtask(data.todoId, userId, { title: data.title });
  }

  static async updateSubtask(data: UpdateSubtaskInput, userId: string): Promise<Todo | null> {
    return todoStore.updateSubtask(data.todoId, data.subtaskId, userId, data);
  }

  static async removeSubtask(data: any, userId: string): Promise<Todo | null> {
    return todoStore.removeSubtask(data.todoId, userId, data.subtaskId);
  }

  static async bulkUpdate(data: any, userId: string): Promise<{ updated: number; failed: number }> {
    const result = todoStore.bulkUpdateStatus(data.ids, data.status, userId);
    return {
      updated: result.updated,
      failed: result.failed.length,
    };
  }

  static async getUserStats(userId: string): Promise<TodoStats> {
    return todoStore.getUserStats(userId);
  }
}
