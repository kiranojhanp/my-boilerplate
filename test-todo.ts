#!/usr/bin/env bun

/**
 * Comprehensive Todo API test script
 * Tests all CRUD operations, filtering, sorting, and advanced features
 * Run with: bun run test-todo.ts
 */

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

class TodoAPITester {
  private results: TestResult[] = [];
  private accessToken: string = "";

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        message: "✅ Passed",
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        message: `❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - start,
      });
    }
  }

  async trpcCall(procedure: string, input?: any, token?: string): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token || this.accessToken) {
      headers.Authorization = `Bearer ${token || this.accessToken}`;
    }

    const response = await fetch(`${BASE_URL}/trpc/${procedure}`, {
      method: input ? "POST" : "GET",
      headers,
      body: input ? JSON.stringify({ input }) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  async setupAuth(): Promise<void> {
    const timestamp = Date.now();
    const testUser = {
      email: `todotest${timestamp}@example.com`,
      username: `todotest${timestamp}`,
      password: "TodoTestPassword123!",
    };

    const result = await this.trpcCall("auth.register", testUser);
    this.accessToken = result.result?.data?.tokens?.accessToken;

    if (!this.accessToken) {
      throw new Error("Failed to get access token");
    }
  }

  async runAllTests(): Promise<void> {
    console.log("📝 Starting Todo API Tests\n");

    // Setup authentication first
    await this.runTest("Authentication Setup", async () => {
      await this.setupAuth();
      console.log("   🔑 Authentication token obtained");
    });

    let todoId: string = "";
    let subtaskId: string = "";

    // Test 1: Create Todo
    await this.runTest("Create Todo", async () => {
      const todoData = {
        title: "Test Todo Item",
        description: "This is a test todo item with full features",
        priority: "high",
        category: "work",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        tags: ["testing", "api", "todo"],
        estimatedMinutes: 120,
        subtasks: [{ title: "First subtask" }, { title: "Second subtask" }],
      };

      const result = await this.trpcCall("todo.create", todoData);
      const data = result.result?.data;

      if (!data?.todo?.id) {
        throw new Error("Todo creation failed");
      }

      todoId = data.todo.id;
      console.log(
        "   📝 Todo created with ID:",
        todoId.substring(0, 8) + "..."
      );
      console.log("   🏷️  Tags:", data.todo.tags);
      console.log("   📊 Subtasks:", data.todo.subtasks.length);
    });

    // Test 2: Get Todo by ID
    await this.runTest("Get Todo by ID", async () => {
      if (!todoId) throw new Error("No todo ID available");

      const result = await this.trpcCall("todo.getById", { id: todoId });
      const data = result.result?.data;

      if (!data?.todo || data.todo.id !== todoId) {
        throw new Error("Failed to retrieve todo");
      }

      console.log("   📋 Todo title:", data.todo.title);
      console.log("   🎯 Priority:", data.todo.priority);
      console.log(
        "   📅 Due date:",
        data.todo.dueDate
          ? new Date(data.todo.dueDate).toLocaleDateString()
          : "None"
      );
      console.log("   ⏱️  Is overdue:", data.metadata.isOverdue);
    });

    // Test 3: Create Multiple Todos for List Testing
    await this.runTest("Create Multiple Todos", async () => {
      const todos = [
        {
          title: "High Priority Task",
          priority: "urgent",
          category: "work",
          status: "in_progress",
        },
        {
          title: "Personal Task",
          priority: "low",
          category: "personal",
          tags: ["personal", "home"],
        },
        {
          title: "Shopping List",
          priority: "medium",
          category: "shopping",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      for (const todo of todos) {
        await this.trpcCall("todo.create", todo);
      }

      console.log("   ➕ Created 3 additional todos for testing");
    });

    // Test 4: List Todos with Filtering
    await this.runTest("List Todos with Filtering", async () => {
      // Test basic listing
      const basicList = await this.trpcCall("todo.list", {});
      const basicData = basicList.result?.data;

      if (!basicData?.todos || !Array.isArray(basicData.todos)) {
        throw new Error("Failed to list todos");
      }

      console.log("   📋 Total todos:", basicData.total);

      // Test filtering by priority
      const highPriorityList = await this.trpcCall("todo.list", {
        priority: "high",
        sortBy: "priority",
        sortOrder: "desc",
      });

      const highPriorityData = highPriorityList.result?.data;
      if (!highPriorityData?.todos) {
        throw new Error("Failed to filter by priority");
      }

      console.log("   🔥 High priority todos:", highPriorityData.todos.length);

      // Test filtering by category
      const workTodos = await this.trpcCall("todo.list", {
        category: "work",
        limit: 10,
      });

      const workData = workTodos.result?.data;
      console.log("   💼 Work todos:", workData?.todos?.length || 0);
    });

    // Test 5: Update Todo
    await this.runTest("Update Todo", async () => {
      if (!todoId) throw new Error("No todo ID available");

      const updates = {
        id: todoId,
        status: "in_progress",
        actualMinutes: 60,
        description: "Updated description with progress notes",
      };

      const result = await this.trpcCall("todo.update", updates);
      const data = result.result?.data;

      if (!data?.todo || data.todo.status !== "in_progress") {
        throw new Error("Todo update failed");
      }

      console.log("   ✏️  Status updated to:", data.todo.status);
      console.log("   ⏰ Actual minutes:", data.todo.actualMinutes);
      console.log("   🔄 Changes made:", data.changes);
    });

    // Test 6: Add Subtask
    await this.runTest("Add Subtask", async () => {
      if (!todoId) throw new Error("No todo ID available");

      const subtaskData = {
        todoId: todoId,
        title: "Additional subtask added via API",
      };

      const result = await this.trpcCall("todo.addSubtask", subtaskData);
      const data = result.result?.data;

      if (!data?.subtask?.id) {
        throw new Error("Subtask creation failed");
      }

      subtaskId = data.subtask.id;
      console.log("   ➕ Subtask added:", data.subtask.title);
      console.log("   🆔 Subtask ID:", subtaskId.substring(0, 8) + "...");
    });

    // Test 7: Update Subtask
    await this.runTest("Update Subtask", async () => {
      if (!todoId || !subtaskId)
        throw new Error("No todo or subtask ID available");

      const updates = {
        todoId: todoId,
        subtaskId: subtaskId,
        completed: true,
        title: "Completed subtask (updated)",
      };

      const result = await this.trpcCall("todo.updateSubtask", updates);
      const data = result.result?.data;

      if (!data?.subtask || !data.subtask.completed) {
        throw new Error("Subtask update failed");
      }

      console.log("   ✅ Subtask completed:", data.subtask.title);
      console.log("   🔄 Changes:", data.changes);
    });

    // Test 8: Get Todo Statistics
    await this.runTest("Get Todo Statistics", async () => {
      const result = await this.trpcCall("todo.getStats");
      const data = result.result?.data;

      if (!data?.stats) {
        throw new Error("Failed to get todo statistics");
      }

      console.log("   📊 Total todos:", data.stats.total);
      console.log("   📈 By status:", JSON.stringify(data.stats.byStatus));
      console.log("   🎯 By priority:", JSON.stringify(data.stats.byPriority));
      console.log("   📂 By category:", JSON.stringify(data.stats.byCategory));
      console.log("   ⚠️  Overdue:", data.stats.overdue);
      console.log("   ⏰ Due soon:", data.stats.dueSoon);
    });

    // Test 9: Search Todos
    await this.runTest("Search Todos", async () => {
      const searchResult = await this.trpcCall("todo.list", {
        search: "test",
        sortBy: "title",
        sortOrder: "asc",
      });

      const data = searchResult.result?.data;
      if (!data?.todos) {
        throw new Error("Search failed");
      }

      console.log("   🔍 Search results for 'test':", data.todos.length);

      // Test tag filtering
      const tagResult = await this.trpcCall("todo.list", {
        tags: ["testing"],
      });

      const tagData = tagResult.result?.data;
      console.log("   🏷️  Tagged with 'testing':", tagData?.todos?.length || 0);
    });

    // Test 10: Bulk Update
    await this.runTest("Bulk Update Todos", async () => {
      // First, get a list of todo IDs
      const listResult = await this.trpcCall("todo.list", { limit: 3 });
      const todos = listResult.result?.data?.todos;

      if (!todos || todos.length === 0) {
        throw new Error("No todos available for bulk update");
      }

      const ids = todos.map((todo: any) => todo.id);
      const bulkUpdates = {
        ids: ids,
        updates: {
          priority: "medium",
        },
      };

      const result = await this.trpcCall("todo.bulkUpdate", bulkUpdates);
      const data = result.result?.data;

      if (!data?.successful) {
        throw new Error("Bulk update failed");
      }

      console.log("   🔄 Bulk updated:", data.successful.length, "todos");
      console.log("   ❌ Failed:", data.failed.length, "todos");
      console.log("   📝 Updates applied:", JSON.stringify(data.updates));
    });

    // Test 11: Date Range Filtering
    await this.runTest("Date Range Filtering", async () => {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const dateRangeResult = await this.trpcCall("todo.list", {
        dueBefore: oneWeekFromNow.toISOString(),
        sortBy: "dueDate",
        sortOrder: "asc",
      });

      const data = dateRangeResult.result?.data;
      if (!data?.todos) {
        throw new Error("Date range filtering failed");
      }

      console.log("   📅 Todos due within a week:", data.todos.length);
    });

    // Test 12: Pagination
    await this.runTest("Pagination", async () => {
      const page1 = await this.trpcCall("todo.list", {
        page: 1,
        limit: 2,
      });

      const data1 = page1.result?.data;
      if (!data1?.todos || !data1.metadata) {
        throw new Error("Pagination failed");
      }

      console.log("   📄 Page 1 todos:", data1.todos.length);
      console.log("   📊 Total pages:", data1.totalPages);
      console.log("   ➡️  Has more:", data1.metadata.hasMore);

      if (data1.totalPages > 1) {
        const page2 = await this.trpcCall("todo.list", {
          page: 2,
          limit: 2,
        });

        const data2 = page2.result?.data;
        console.log("   📄 Page 2 todos:", data2?.todos?.length || 0);
      }
    });

    // Test 13: Complete Todo Workflow
    await this.runTest("Complete Todo Workflow", async () => {
      // Create a todo
      const newTodo = await this.trpcCall("todo.create", {
        title: "Workflow Test Todo",
        priority: "medium",
        category: "work",
      });

      const workflowTodoId = newTodo.result?.data?.todo?.id;
      if (!workflowTodoId) throw new Error("Failed to create workflow todo");

      // Update status to in_progress
      await this.trpcCall("todo.update", {
        id: workflowTodoId,
        status: "in_progress",
      });

      // Complete the todo
      const completedTodo = await this.trpcCall("todo.update", {
        id: workflowTodoId,
        status: "completed",
        actualMinutes: 45,
      });

      const completedData = completedTodo.result?.data;
      if (!completedData?.todo?.completedAt) {
        throw new Error("Todo completion workflow failed");
      }

      console.log("   ✅ Todo completed successfully");
      console.log(
        "   🕐 Completed at:",
        new Date(completedData.todo.completedAt).toLocaleString()
      );
      console.log(
        "   ⏱️  Actual time:",
        completedData.todo.actualMinutes,
        "minutes"
      );
    });

    // Test 14: Error Handling
    await this.runTest("Error Handling", async () => {
      try {
        // Try to get non-existent todo
        await this.trpcCall("todo.getById", {
          id: "00000000-0000-0000-0000-000000000000",
        });
        throw new Error("Should have failed with non-existent todo");
      } catch (error) {
        if (
          !String(error).includes("NOT_FOUND") &&
          !String(error).includes("404")
        ) {
          throw error;
        }
        console.log("   ✅ Properly handled non-existent todo");
      }

      try {
        // Try to create todo with invalid data
        await this.trpcCall("todo.create", {
          title: "", // Empty title should fail
          priority: "invalid_priority",
        });
        throw new Error("Should have failed with invalid data");
      } catch (error) {
        if (
          !String(error).includes("validation") &&
          !String(error).includes("400")
        ) {
          throw error;
        }
        console.log("   ✅ Properly handled validation errors");
      }
    });

    // Test 15: Delete Operations
    await this.runTest("Delete Operations", async () => {
      if (!todoId || !subtaskId)
        throw new Error("No IDs available for deletion");

      // Delete subtask first
      const deleteSubtaskResult = await this.trpcCall("todo.deleteSubtask", {
        todoId: todoId,
        subtaskId: subtaskId,
      });

      if (!deleteSubtaskResult.result?.data?.deletedSubtaskId) {
        throw new Error("Subtask deletion failed");
      }

      console.log("   🗑️  Subtask deleted");

      // Delete the main todo
      const deleteTodoResult = await this.trpcCall("todo.delete", {
        id: todoId,
      });

      if (!deleteTodoResult.result?.data?.deletedId) {
        throw new Error("Todo deletion failed");
      }

      console.log("   🗑️  Todo deleted");
    });

    // Print results
    this.printResults();
  }

  printResults(): void {
    console.log("\n" + "=".repeat(80));
    console.log("📝 TODO API TEST RESULTS");
    console.log("=".repeat(80));

    let passed = 0;
    let failed = 0;

    this.results.forEach((result, index) => {
      console.log(
        `${index + 1}. ${result.name} - ${result.message} (${result.duration}ms)`
      );
      if (result.passed) passed++;
      else failed++;
    });

    console.log("=".repeat(80));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(
      `📊 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`
    );
    console.log("=".repeat(80));

    if (failed > 0) {
      console.log(
        "\n⚠️  Some tests failed. Check the server logs for more details."
      );
      process.exit(1);
    } else {
      console.log(
        "\n🎉 All todo tests passed! Full CRUD functionality working perfectly."
      );
      console.log(
        "📝 Features tested: Create, Read, Update, Delete, Search, Filter, Sort, Pagination, Statistics, Bulk operations"
      );
    }
  }
}

// Main execution
async function main() {
  // Check if server is running
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error("Server not responding");
    }
  } catch (error) {
    console.error("❌ Server is not running at", BASE_URL);
    console.log("Please start the server with: bun run dev");
    process.exit(1);
  }

  const tester = new TodoAPITester();
  await tester.runAllTests();
}

main().catch(console.error);
