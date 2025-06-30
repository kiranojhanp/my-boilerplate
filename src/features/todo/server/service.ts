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
import { db } from "@/server/shared/db";
import {
  todos,
  subtasks,
  type Todo,
  type NewTodo,
  type Subtask,
  type NewSubtask,
} from "@/server/shared/db/schema";
import type {
  CreateTodoInput,
  UpdateTodoInput,
  ListTodosInput,
  TodoStats,
  TodoListResponse,
} from "@/features/todo/types";
import { logger } from "@/server/shared/utils/logger";

// Extended update input with subtasks for internal use
interface ExtendedUpdateTodoInput extends UpdateTodoInput {
  subtasks?: { title: string }[];
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

    logger.info(`Created todo with ID: ${todo.id}`);

    // Create subtasks if provided
    const createdSubtasks: Subtask[] = [];
    if (data.subtasks && data.subtasks.length > 0) {
      const subtaskData = data.subtasks.map((subtask) => ({
        todoId: todo.id,
        title: subtask.title,
      }));

      const insertedSubtasks = await db
        .insert(subtasks)
        .values(subtaskData)
        .returning();

      createdSubtasks.push(...insertedSubtasks);
    }

    return {
      ...todo,
      tags: todo.tags || [],
      subtasks: createdSubtasks,
    } as Todo & { subtasks: Subtask[] };
  }

  static async listTodos(
    filters: Partial<ListTodosInput> = {}
  ): Promise<TodoListResponse> {
    const {
      status,
      priority,
      category,
      search,
      tags,
      dueBefore,
      dueAfter,
      sortBy = "createdAt",
      sortOrder = "desc",
      limit = 50,
      offset = 0,
    } = filters;

    // Build where conditions
    const conditions = [];

    if (status) conditions.push(eq(todos.status, status));
    if (priority) conditions.push(eq(todos.priority, priority));
    if (category) conditions.push(eq(todos.category, category));
    if (search) {
      conditions.push(
        or(
          like(todos.title, `%${search}%`),
          like(todos.description, `%${search}%`)
        )
      );
    }
    if (dueBefore) conditions.push(lte(todos.dueDate, dueBefore));
    if (dueAfter) conditions.push(gte(todos.dueDate, dueAfter));

    // Handle tags filtering
    if (tags && tags.length > 0) {
      const tagConditions = tags.map(
        (tag) => sql`JSON_SEARCH(${todos.tags}, 'one', ${tag}) IS NOT NULL`
      );
      conditions.push(or(...tagConditions));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get count for pagination
    const countResult = await db
      .select({ count: count() })
      .from(todos)
      .where(whereClause);

    const totalCount = countResult[0]?.count || 0;

    // Build sort order
    const orderBy =
      sortOrder === "asc" ? asc(todos[sortBy]) : desc(todos[sortBy]);

    // Get todos with pagination
    const todoList = await db
      .select()
      .from(todos)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get subtasks for each todo
    const todosWithSubtasks = await Promise.all(
      todoList.map(async (todo) => {
        const todoSubtasks = await db
          .select()
          .from(subtasks)
          .where(eq(subtasks.todoId, todo.id))
          .orderBy(asc(subtasks.createdAt));

        return {
          ...todo,
          tags: todo.tags || [],
          subtasks: todoSubtasks,
        } as Todo & { subtasks: Subtask[] };
      })
    );

    return {
      todos: todosWithSubtasks as any, // Type casting due to database schema differences
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };
  }

  static async getTodoById(
    id: string
  ): Promise<(Todo & { subtasks: Subtask[] }) | null> {
    const [todo] = await db.select().from(todos).where(eq(todos.id, id));

    if (!todo) {
      return null;
    }

    const todoSubtasks = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.todoId, id))
      .orderBy(asc(subtasks.createdAt));

    return {
      ...todo,
      tags: todo.tags || [],
      subtasks: todoSubtasks,
    } as Todo & { subtasks: Subtask[] };
  }

  static async updateTodo(
    data: ExtendedUpdateTodoInput
  ): Promise<(Todo & { subtasks: Subtask[] }) | null> {
    const { id, subtasks: newSubtasks, ...updateData } = data;

    // Update the todo
    const [updatedTodo] = await db
      .update(todos)
      .set({
        ...updateData,
        updatedAt: new Date(),
        ...(data.status === "completed" ? { completedAt: new Date() } : {}),
      })
      .where(eq(todos.id, id))
      .returning();

    if (!updatedTodo) {
      return null;
    }

    logger.info(`Updated todo with ID: ${id}`);

    // Handle subtasks update if provided
    let todoSubtasks: Subtask[] = [];
    if (newSubtasks !== undefined) {
      // Delete existing subtasks
      await db.delete(subtasks).where(eq(subtasks.todoId, id));

      // Create new subtasks
      if (newSubtasks.length > 0) {
        const subtaskData = newSubtasks.map((subtask) => ({
          todoId: id,
          title: subtask.title,
        }));

        todoSubtasks = await db
          .insert(subtasks)
          .values(subtaskData)
          .returning();
      }
    } else {
      // If subtasks not provided, get existing ones
      todoSubtasks = await db
        .select()
        .from(subtasks)
        .where(eq(subtasks.todoId, id))
        .orderBy(asc(subtasks.createdAt));
    }

    return {
      ...updatedTodo,
      subtasks: todoSubtasks,
    };
  }

  static async deleteTodo(id: string): Promise<boolean> {
    // Delete subtasks first (cascade)
    await db.delete(subtasks).where(eq(subtasks.todoId, id));

    // Delete the todo
    const [deletedTodo] = await db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning();

    if (deletedTodo) {
      logger.info(`Deleted todo with ID: ${id}`);
      return true;
    }

    return false;
  }

  static async updateSubtask(
    todoId: string,
    subtaskId: string,
    data: { title?: string; completed?: boolean }
  ): Promise<Subtask | null> {
    const [updatedSubtask] = await db
      .update(subtasks)
      .set(data)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.todoId, todoId)))
      .returning();

    if (updatedSubtask) {
      logger.info(`Updated subtask with ID: ${subtaskId}`);
    }

    return updatedSubtask || null;
  }

  static async getStats(
    period: "day" | "week" | "month" | "year" = "week"
  ): Promise<TodoStats> {
    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get total counts
    const totalResult = await db.select({ count: count() }).from(todos);
    const total = totalResult[0]?.count || 0;

    // Get counts by status
    const statusCounts = await db
      .select({
        status: todos.status,
        count: count(),
      })
      .from(todos)
      .groupBy(todos.status);

    // Get counts by priority
    const priorityCounts = await db
      .select({
        priority: todos.priority,
        count: count(),
      })
      .from(todos)
      .groupBy(todos.priority);

    // Get counts by category
    const categoryCounts = await db
      .select({
        category: todos.category,
        count: count(),
      })
      .from(todos)
      .groupBy(todos.category);

    // Calculate average completion time
    const completedTodos = await db
      .select({
        createdAt: todos.createdAt,
        completedAt: todos.completedAt,
      })
      .from(todos)
      .where(eq(todos.status, "completed"));

    let averageCompletionTime: number | null = null;
    if (completedTodos.length > 0) {
      const totalTime = completedTodos.reduce((sum, todo) => {
        if (todo.completedAt && todo.createdAt) {
          return sum + (todo.completedAt.getTime() - todo.createdAt.getTime());
        }
        return sum;
      }, 0);
      averageCompletionTime =
        totalTime / completedTodos.length / (1000 * 60 * 60); // Convert to hours
    }

    // Helper functions to get counts
    const getStatusCount = (status: string) =>
      statusCounts.find((s) => s.status === status)?.count || 0;
    const getPriorityCount = (priority: string) =>
      priorityCounts.find((p) => p.priority === priority)?.count || 0;
    const getCategoryCount = (category: string) =>
      categoryCounts.find((c) => c.category === category)?.count || 0;

    // Calculate productivity score (completed / total * 100)
    const completed = getStatusCount("completed");
    const productivityScore = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      pending: getStatusCount("pending"),
      inProgress: getStatusCount("in_progress"),
      cancelled: getStatusCount("cancelled"),
      byPriority: {
        low: getPriorityCount("low"),
        medium: getPriorityCount("medium"),
        high: getPriorityCount("high"),
        urgent: getPriorityCount("urgent"),
      },
      byCategory: {
        personal: getCategoryCount("personal"),
        work: getCategoryCount("work"),
        shopping: getCategoryCount("shopping"),
        health: getCategoryCount("health"),
        learning: getCategoryCount("learning"),
        other: getCategoryCount("other"),
      },
      averageCompletionTime,
      productivityScore,
    };
  }
}
