# Optimized Feature-Based Architecture

This project uses an optimized feature-based structure that promotes code organization, reusability, and developer productivity.

## 🏗️ Structure Overview

```
src/
├── features/                    # 🎯 Feature-based organization
│   └── {feature-name}/          # Each feature is self-contained
│       ├── index.ts             # 📤 Public API exports
│       ├── types.ts             # 📝 Shared schemas & types (Zod + TypeScript)
│       ├── server/              # 🖥️ Server-side code
│       │   ├── index.ts         # Server exports
│       │   ├── router.ts        # tRPC routes
│       │   └── service.ts       # Business logic
│       └── web/                 # 🌐 Client-side code
│           ├── index.ts         # Web exports
│           ├── routes.tsx       # React routes
│           ├── hooks/           # React hooks
│           ├── components/      # React components
│           └── styles/          # Component styles
├── server/                      # 🖥️ Server-only shared code
│   ├── main.ts                  # Server entry point
│   └── shared/                  # Shared server utilities
└── web/                         # 🌐 Web-only shared code
    ├── main.tsx                 # Web entry point
    └── shared/                  # Shared web utilities
```

## 🎯 Key Benefits

### 1. **Consistency**

- **Identical structure** for server and web code within each feature
- **Predictable file locations** - you always know where to find things
- **Shared types** between server and web prevent drift

### 2. **Developer Experience**

- **Single command** to create new features: `bun run create-feature <name>`
- **Focus on coding** - structure decisions are made for you
- **Easy imports** - clean public APIs via index files

### 3. **Scalability**

- **Feature isolation** - features don't interfere with each other
- **Lazy loading** built-in for web components
- **Tree shaking** friendly exports

### 4. **Type Safety**

- **Shared Zod schemas** ensure runtime validation
- **tRPC integration** provides end-to-end type safety
- **TypeScript types** derived from schemas

## 🚀 Getting Started

### Creating a New Feature

```bash
# Create a new feature with full scaffolding
bun run create-feature user
bun run create-feature product
bun run create-feature auth
```

This creates:

- ✅ Complete folder structure
- ✅ Boilerplate code with proper imports
- ✅ Type-safe schemas
- ✅ tRPC router setup
- ✅ React components and hooks
- ✅ Lazy-loaded routes

### Working with Features

#### Server Side

```typescript
// Import server-side feature code
import { todoRouter, TodoService } from "@/features/todo/server";

// Or import everything
import * as todo from "@/features/todo";
const service = todo.TodoService;
```

#### Web Side

```typescript
// Import web-side feature code
import { TodoForm, useTodos } from "@/features/todo/web";

// Or import everything
import * as todo from "@/features/todo";
const TodoForm = todo.TodoForm;
```

#### Shared Types

```typescript
// Import shared types (works in both server and web)
import type { Todo, CreateTodoInput } from "@/features/todo/types";
```

## 📁 Feature Anatomy

Each feature follows this exact structure:

### `types.ts` - Shared Foundation

```typescript
// Zod schemas for validation
export const TodoSchema = z.object({...});

// TypeScript types derived from schemas
export type Todo = z.infer<typeof TodoSchema>;
```

### `server/` - Backend Logic

```typescript
// service.ts - Business logic
export class TodoService {
  static async createTodo(data: CreateTodoInput) {...}
}

// router.ts - tRPC routes
export const todoRouter = router({
  create: loggedProcedure.input(CreateTodoInputSchema)...
});
```

### `web/` - Frontend Logic

```typescript
// hooks/useTodos.ts - React Query integration
export function useTodos() {
  return trpc.todo.list.useQuery();
}

// components/TodoForm/index.tsx - React components
export function TodoForm() {...}

// routes.tsx - React Router routes
export const todoRoutes = [...];
```

## 🛠️ Development Workflow

### 1. Plan Your Feature

- Define the core entities and operations
- List the required API endpoints
- Sketch the UI components needed

### 2. Generate Scaffolding

```bash
bun run create-feature my-feature
```

### 3. Define Types First

Edit `src/features/my-feature/types.ts`:

- Add Zod schemas for validation
- Export TypeScript types
- Define input/output interfaces

### 4. Implement Server Logic

- Add database operations in `service.ts`
- Define tRPC routes in `router.ts`
- Add router to main tRPC router

### 5. Build Web Interface

- Create React hooks for data fetching
- Build UI components
- Add routes if needed

### 6. Test & Iterate

- Type safety is built-in
- Hot reload for both server and web
- All imports work immediately

## 🔄 Migration Guide

### From Old Structure

1. **Move server code**: `src/server/features/todo/*` → `src/features/todo/server/`
2. **Move web code**: `src/web/features/todo/*` → `src/features/todo/web/`
3. **Create shared types**: Extract schemas to `src/features/todo/types.ts`
4. **Update imports**: Use new feature-based imports
5. **Update routers**: Import from new locations

### Benefits Immediately Available

- ✅ Cleaner imports
- ✅ Better type sharing
- ✅ Consistent structure
- ✅ Feature isolation

## 📚 Best Practices

### Naming Conventions

- **Features**: kebab-case (`user-profile`, `todo-list`)
- **Components**: PascalCase (`UserProfile`, `TodoForm`)
- **Files**: camelCase or kebab-case consistently
- **Types**: PascalCase with descriptive suffixes (`CreateUserInput`, `UserResponse`)

### Import Organization

```typescript
// 1. External libraries
import { z } from "zod";
import React from "react";

// 2. Internal shared utilities
import { trpc } from "@/web/shared/lib/trpc";

// 3. Feature imports
import type { User } from "@/features/user/types";
import { UserService } from "@/features/user/server";

// 4. Local imports
import "./styles.module.css";
```

### Component Organization

- **One component per folder** with index.tsx and styles
- **Co-locate related files** (tests, stories, etc.)
- **Use CSS modules** for styling
- **Export from index files** for clean imports

## 🎊 Why This Structure Rocks

1. **New developers** can be productive immediately - the structure is self-explanatory
2. **Feature teams** can work independently without conflicts
3. **Code reuse** is natural - features expose clean APIs
4. **Refactoring** is easier - everything related is co-located
5. **Testing** is simpler - each feature is isolated
6. **Deployment** can be optimized - unused features can be tree-shaken

## 🚀 Next Steps

- Run `bun run create-feature example` to see it in action
- Migrate existing features one by one
- Customize the generator script for your specific needs
- Add feature-level testing setup
- Consider feature flags for deployment

Happy coding! 🎉
