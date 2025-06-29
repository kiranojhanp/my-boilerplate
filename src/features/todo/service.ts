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
import { db } from "../../shared/db/index.js";
import {
  todos,
  subtasks,
  type Todo,
  type NewTodo,
  type Subtask,
  type NewSubtask,
} from "../../shared/db/schema.js";
import type {
  CreateTodoInput,
  UpdateTodoInput,
  ListTodosInput,
  TodoStats,
  CreateSubtaskInput,
} from "./schemas.js";
import { logger } from "../../shared/utils/logger.js";

// Extended update input with subtasks for internal use
interface ExtendedUpdateTodoInput extends UpdateTodoInput {
  subtasks?: CreateSubtaskInput[];
}

// TodoService class for handling business logic with Drizzle ORM
export class TodoService {
  static async createTodo(
    data: CreateTodoInput
  ): Promise<Todo & { subtasks: Subtask[] }> {
    const [todo] = await db
      .insert(todos)
      .values({
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        tags: data.tags || [],
        estimatedMinutes: data.estimatedMinutes,
      })
      .returning();

    if (!todo) {
      throw new Error("Failed to create todo");
    }

    // Create subtasks if provided
    const createdSubtasks: Subtask[] = [];
    if (data.subtasks && data.subtasks.length > 0) {
      const subtaskData = data.subtasks.map((st, index) => ({
        todoId: todo.id,
        title: st.title,
        order: index,
      }));

      const insertedSubtasks = await db
        .insert(subtasks)
        .values(subtaskData)
        .returning();
      createdSubtasks.push(...insertedSubtasks);
    }

    logger.info(`Todo created: ${todo.title}`, {
      todoId: todo.id,
      priority: todo.priority,
      category: todo.category,
    });

    return { ...todo, subtasks: createdSubtasks };
  }

  static async getTodoById(
    id: string
  ): Promise<(Todo & { subtasks: Subtask[] }) | null> {
    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
      with: {
        subtasks: {
          orderBy: asc(subtasks.order),
        },
      },
    });

    return todo || null;
  }

  static async listTodos(filters: ListTodosInput): Promise<{
    todos: (Todo & { subtasks: Subtask[] })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Build WHERE conditions
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(todos.status, filters.status));
    }

    if (filters.priority) {
      conditions.push(eq(todos.priority, filters.priority));
    }

    if (filters.category) {
      conditions.push(eq(todos.category, filters.category));
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(like(todos.title, searchTerm), like(todos.description, searchTerm))
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      // SQLite JSON search for tags
      const tagConditions = filters.tags.map(
        (tag) => sql`json_extract(${todos.tags}, '$') LIKE ${`%"${tag}"%`}`
      );
      conditions.push(or(...tagConditions));
    }

    if (filters.dueBefore) {
      conditions.push(lte(todos.dueDate, filters.dueBefore));
    }

    if (filters.dueAfter) {
      conditions.push(gte(todos.dueDate, filters.dueAfter));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build ORDER BY
    let orderBy;
    const order = filters.sortOrder === "asc" ? asc : desc;

    switch (filters.sortBy) {
      case "priority":
        // Custom priority ordering: urgent > high > medium > low
        orderBy = sql`CASE ${todos.priority} 
          WHEN 'urgent' THEN 4 
          WHEN 'high' THEN 3 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 1 
          END ${filters.sortOrder === "asc" ? sql`ASC` : sql`DESC`}`;
        break;
      case "dueDate":
        orderBy = order(todos.dueDate);
        break;
      case "title":
        orderBy = order(todos.title);
        break;
      case "createdAt":
        orderBy = order(todos.createdAt);
        break;
      case "updatedAt":
      default:
        orderBy = order(todos.updatedAt);
        break;
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(todos)
      .where(whereClause);

    const total = totalResult[0]?.count ?? 0;

    // Get paginated results
    const offset = (filters.page - 1) * filters.limit;
    const todosList = await db.query.todos.findMany({
      where: whereClause,
      with: {
        subtasks: {
          orderBy: asc(subtasks.order),
        },
      },
      orderBy,
      limit: filters.limit,
      offset,
    });

    const totalPages = Math.ceil(total / filters.limit);

    return {
      todos: todosList,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    };
  }

  static async updateTodo(
    data: ExtendedUpdateTodoInput
  ): Promise<(Todo & { subtasks: Subtask[] }) | null> {
    const existingTodo = await this.getTodoById(data.id);
    if (!existingTodo) return null;

    // Prepare update data
    const updateData: Partial<NewTodo> = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      category: data.category,
      dueDate: data.dueDate,
      tags: data.tags,
      estimatedMinutes: data.estimatedMinutes,
      actualMinutes: data.actualMinutes,
      updatedAt: new Date(),
    };

    // Handle status change to completed
    if (data.status === "completed" && existingTodo.status !== "completed") {
      updateData.completedAt = new Date();
    }

    // Update the todo
    const updatedTodos = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, data.id))
      .returning();

    const updatedTodo = updatedTodos[0];
    if (!updatedTodo) {
      throw new Error("Failed to update todo");
    }

    // Handle subtasks update if provided
    if (data.subtasks) {
      // Delete existing subtasks
      await db.delete(subtasks).where(eq(subtasks.todoId, data.id));

      // Insert new subtasks
      if (data.subtasks.length > 0) {
        const subtaskData = data.subtasks.map((st, index) => ({
          todoId: data.id,
          title: st.title,
          completed: false,
          order: index,
        }));

        await db.insert(subtasks).values(subtaskData);
      }
    }

    logger.info(`Todo updated: ${updatedTodo.title}`, {
      todoId: data.id,
      updates: Object.keys(data),
    });

    // Return updated todo with subtasks
    return this.getTodoById(data.id);
  }

  static async deleteTodo(id: string): Promise<boolean> {
    const todo = await this.getTodoById(id);
    if (!todo) return false;

    // Delete todo (subtasks will be deleted due to cascade)
    await db.delete(todos).where(eq(todos.id, id));

    logger.info(`Todo deleted: ${todo.title}`, {
      todoId: id,
    });

    return true;
  }

  static async getStats(): Promise<TodoStats> {
    // Get all todos count and status breakdown
    const statsResults = await db
      .select({
        total: count(),
        pending: count(sql`CASE WHEN ${todos.status} = 'pending' THEN 1 END`),
        inProgress: count(
          sql`CASE WHEN ${todos.status} = 'in_progress' THEN 1 END`
        ),
        completed: count(
          sql`CASE WHEN ${todos.status} = 'completed' THEN 1 END`
        ),
        cancelled: count(
          sql`CASE WHEN ${todos.status} = 'cancelled' THEN 1 END`
        ),
        overdue: count(
          sql`CASE WHEN ${todos.dueDate} < ${new Date()} AND ${todos.status} != 'completed' THEN 1 END`
        ),
      })
      .from(todos);

    const statsResult = statsResults[0] ?? {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
    };

    // Get priority breakdown
    const priorityStats = await db
      .select({
        priority: todos.priority,
        count: count(),
      })
      .from(todos)
      .groupBy(todos.priority);

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    priorityStats.forEach(({ priority, count }) => {
      byPriority[priority] = count;
    });

    // Get category breakdown
    const categoryStats = await db
      .select({
        category: todos.category,
        count: count(),
      })
      .from(todos)
      .groupBy(todos.category);

    const byCategory: Record<string, number> = {};
    categoryStats.forEach(({ category, count }) => {
      byCategory[category] = count;
    });

    return {
      total: statsResult.total,
      pending: statsResult.pending,
      inProgress: statsResult.inProgress,
      completed: statsResult.completed,
      cancelled: statsResult.cancelled,
      overdue: statsResult.overdue,
      byPriority,
      byCategory,
    };
  }
}
