# Todo API Documentation

A comprehensive Todo management system built with **tRPC**, **Zod validation**, **SuperJSON**, and **Bun authentication**.

## 🚀 Features

- **Full CRUD Operations**: Create, read, update, delete todos
- **Advanced Filtering**: Filter by status, priority, category, tags, date ranges
- **Flexible Sorting**: Sort by title, priority, due date, creation date
- **Pagination**: Efficient pagination with metadata
- **Subtask Management**: Add, update, delete subtasks
- **Statistics**: Comprehensive todo statistics and insights
- **Bulk Operations**: Update multiple todos at once
- **Search**: Full-text search across titles and descriptions
- **Type Safety**: Full TypeScript support with tRPC
- **Validation**: Comprehensive Zod validation for all inputs
- **Authentication**: JWT-based authentication required for all operations

## 📝 Todo Data Model

### Todo Schema

```typescript
interface Todo {
  id: string; // UUID
  title: string; // 1-200 characters
  description?: string; // Optional, max 1000 characters
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  category: "personal" | "work" | "shopping" | "health" | "learning" | "other";
  dueDate?: Date; // Optional due date
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-updated
  completedAt?: Date; // Set when status changes to completed
  userId: string; // Owner's user ID
  tags: string[]; // Array of tags (max 10, each max 50 chars)
  estimatedMinutes?: number; // Estimated time (1-10080 minutes)
  actualMinutes?: number; // Actual time spent
  subtasks: SubTask[]; // Array of subtasks
}

interface SubTask {
  id: string; // UUID
  title: string; // 1-100 characters
  completed: boolean; // Completion status
  createdAt: Date; // Auto-generated
}
```

## 🔧 API Endpoints

All endpoints require authentication via JWT token in the `Authorization: Bearer <token>` header.

### Create Todo

**Endpoint**: `POST /trpc/todo.create`

**Input**:

```json
{
  "input": {
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high",
    "category": "work",
    "dueDate": "2024-12-31T23:59:59.999Z",
    "tags": ["documentation", "api", "project"],
    "estimatedMinutes": 120,
    "subtasks": [
      { "title": "Write endpoint documentation" },
      { "title": "Add code examples" }
    ]
  }
}
```

**Response**:

```json
{
  "result": {
    "data": {
      "message": "Todo created successfully",
      "todo": {
        "id": "uuid-here",
        "title": "Complete project documentation",
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z"
        // ... other fields
      },
      "metadata": {
        "createdBy": "username",
        "hash": "secure-hash",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

### Get Todo by ID

**Endpoint**: `GET /trpc/todo.getById?input={"id":"uuid"}`

**Response**:

```json
{
  "result": {
    "data": {
      "todo": {
        /* todo object */
      },
      "metadata": {
        "subtaskCount": 2,
        "completedSubtasks": 1,
        "isOverdue": false,
        "timeRemaining": 86400000
      }
    }
  }
}
```

### List Todos

**Endpoint**: `GET /trpc/todo.list?input={...}`

**Query Parameters**:

```typescript
{
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  category?: "personal" | "work" | "shopping" | "health" | "learning" | "other";
  search?: string;                    // Search in title/description
  tags?: string[];                    // Filter by tags
  dueBefore?: string;                 // ISO date string
  dueAfter?: string;                  // ISO date string
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "priority" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;                      // Default: 1
  limit?: number;                     // Default: 20, max: 100
}
```

**Example**: `GET /trpc/todo.list?input={"status":"pending","priority":"high","sortBy":"dueDate","page":1,"limit":10}`

**Response**:

```json
{
  "result": {
    "data": {
      "todos": [
        /* array of todo objects */
      ],
      "total": 25,
      "page": 1,
      "totalPages": 3,
      "metadata": {
        "hasMore": true,
        "filters": {
          /* applied filters */
        },
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

### Update Todo

**Endpoint**: `POST /trpc/todo.update`

**Input**:

```json
{
  "input": {
    "id": "uuid-here",
    "status": "in_progress",
    "actualMinutes": 60,
    "description": "Updated description"
  }
}
```

### Delete Todo

**Endpoint**: `POST /trpc/todo.delete`

**Input**:

```json
{
  "input": {
    "id": "uuid-here"
  }
}
```

### Subtask Management

#### Add Subtask

**Endpoint**: `POST /trpc/todo.addSubtask`

```json
{
  "input": {
    "todoId": "uuid-here",
    "title": "New subtask"
  }
}
```

#### Update Subtask

**Endpoint**: `POST /trpc/todo.updateSubtask`

```json
{
  "input": {
    "todoId": "uuid-here",
    "subtaskId": "subtask-uuid",
    "title": "Updated subtask title",
    "completed": true
  }
}
```

#### Delete Subtask

**Endpoint**: `POST /trpc/todo.deleteSubtask`

```json
{
  "input": {
    "todoId": "uuid-here",
    "subtaskId": "subtask-uuid"
  }
}
```

### Get Statistics

**Endpoint**: `GET /trpc/todo.getStats`

**Response**:

```json
{
  "result": {
    "data": {
      "stats": {
        "total": 42,
        "byStatus": {
          "pending": 15,
          "in_progress": 8,
          "completed": 18,
          "cancelled": 1
        },
        "byPriority": {
          "low": 10,
          "medium": 20,
          "high": 10,
          "urgent": 2
        },
        "byCategory": {
          "work": 25,
          "personal": 12,
          "shopping": 3,
          "health": 2
        },
        "overdue": 3,
        "dueSoon": 5,
        "completedThisWeek": 7
      },
      "user": {
        "id": "user-uuid",
        "username": "john_doe"
      },
      "timestamp": "2024-01-01T00:00:00.000Z",
      "metadata": "Map object with additional info"
    }
  }
}
```

### Bulk Update

**Endpoint**: `POST /trpc/todo.bulkUpdate`

**Input**:

```json
{
  "input": {
    "ids": ["uuid1", "uuid2", "uuid3"],
    "updates": {
      "status": "completed",
      "priority": "medium"
    }
  }
}
```

**Response**:

```json
{
  "result": {
    "data": {
      "message": "Bulk update completed: 2 successful, 1 failed",
      "successful": ["uuid1", "uuid2"],
      "failed": ["uuid3"],
      "updates": { "status": "completed", "priority": "medium" },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 🧪 Testing

### Run Todo Tests

```bash
# Start the server
bun run dev

# Run comprehensive todo tests
bun run test:todo
```

### Test Coverage

The test suite covers:

- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Subtask management
- ✅ Filtering and search
- ✅ Sorting and pagination
- ✅ Statistics generation
- ✅ Bulk operations
- ✅ Date range filtering
- ✅ Error handling
- ✅ Authentication integration
- ✅ Validation testing

### Example Test Results

```
📝 TODO API TEST RESULTS
================================================================================
1. Authentication Setup - ✅ Passed (150ms)
2. Create Todo - ✅ Passed (45ms)
3. Get Todo by ID - ✅ Passed (12ms)
4. Create Multiple Todos - ✅ Passed (89ms)
5. List Todos with Filtering - ✅ Passed (78ms)
6. Update Todo - ✅ Passed (23ms)
7. Add Subtask - ✅ Passed (18ms)
8. Update Subtask - ✅ Passed (15ms)
9. Get Todo Statistics - ✅ Passed (25ms)
10. Search Todos - ✅ Passed (34ms)
11. Bulk Update Todos - ✅ Passed (67ms)
12. Date Range Filtering - ✅ Passed (29ms)
13. Pagination - ✅ Passed (42ms)
14. Complete Todo Workflow - ✅ Passed (98ms)
15. Error Handling - ✅ Passed (56ms)
16. Delete Operations - ✅ Passed (31ms)
================================================================================
✅ Passed: 16
❌ Failed: 0
📊 Success Rate: 100.0%
```

## 📊 Usage Examples

### Create a Work Task with Subtasks

```bash
curl -X POST http://localhost:3000/trpc/todo.create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "input": {
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication to the API",
      "priority": "high",
      "category": "work",
      "dueDate": "2024-01-15T17:00:00.000Z",
      "tags": ["backend", "security", "api"],
      "estimatedMinutes": 240,
      "subtasks": [
        {"title": "Set up JWT middleware"},
        {"title": "Create login endpoint"},
        {"title": "Add password hashing"},
        {"title": "Write authentication tests"}
      ]
    }
  }'
```

### Filter High Priority Work Items

```bash
curl "http://localhost:3000/trpc/todo.list?input=%7B%22priority%22%3A%22high%22%2C%22category%22%3A%22work%22%2C%22status%22%3A%22pending%22%2C%22sortBy%22%3A%22dueDate%22%2C%22sortOrder%22%3A%22asc%22%7D" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search for Documentation Tasks

```bash
curl "http://localhost:3000/trpc/todo.list?input=%7B%22search%22%3A%22documentation%22%2C%22tags%22%3A%5B%22docs%22%5D%7D" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Multiple Todos to Medium Priority

```bash
curl -X POST http://localhost:3000/trpc/todo.bulkUpdate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "input": {
      "ids": ["uuid1", "uuid2", "uuid3"],
      "updates": {
        "priority": "medium"
      }
    }
  }'
```

## 🔍 Advanced Features

### SuperJSON Integration

The Todo API leverages SuperJSON for enhanced data serialization:

- **Date Objects**: `createdAt`, `updatedAt`, `completedAt`, `dueDate` are preserved as Date objects
- **Map Objects**: Statistics metadata uses Map for better type safety
- **Complex Types**: Proper serialization of nested objects and arrays

### Zod Validation

Comprehensive validation includes:

- **String Validation**: Length limits, regex patterns, trimming
- **Date Validation**: Future date requirements, proper formatting
- **Array Validation**: Uniqueness, length limits, nested object validation
- **Custom Refinements**: Cross-field validation, business logic validation
- **Transform**: Data transformation during validation (e.g., tag normalization)

### Performance Optimizations

- **Pagination**: Efficient pagination with metadata
- **Indexing**: In-memory maps for fast lookups
- **Filtering**: Early filtering to reduce processing overhead
- **Bulk Operations**: Optimized batch processing with error handling

### Security Features

- **User Isolation**: Todos are isolated per user
- **Input Sanitization**: All inputs are validated and sanitized
- **Authentication**: JWT token required for all operations
- **Data Hashing**: Secure hashing for data integrity

## 🚀 Production Considerations

### Database Integration

Replace the in-memory store with a production database:

```typescript
// Example with Prisma
export class DatabaseTodoStore implements TodoStore {
  async createTodo(userId: string, data: CreateTodoInput): Promise<Todo> {
    return await prisma.todo.create({
      data: {
        ...data,
        userId,
        subtasks: {
          create: data.subtasks.map((st) => ({ title: st.title })),
        },
      },
      include: {
        subtasks: true,
      },
    });
  }

  // ... other methods
}
```

### Caching

Add Redis caching for frequently accessed data:

```typescript
// Cache todo statistics
const cacheKey = `todo:stats:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}

const stats = await todoStore.getTodoStats(userId);
await redis.setex(cacheKey, 300, JSON.stringify(stats)); // 5 min cache
```

### Real-time Updates

Add WebSocket support for real-time todo updates:

```typescript
// Emit updates to connected clients
websocket.emit("todoUpdated", {
  userId,
  todoId,
  action: "update",
  data: updatedTodo,
});
```

### Performance Monitoring

Track API performance:

```typescript
// Add metrics to track todo operations
todoOperationsCounter.inc({ operation: "create", userId });
todoOperationDuration.observe({ operation: "create" }, duration);
```

This Todo API provides a solid foundation for building todo management applications with modern web technologies and best practices.
