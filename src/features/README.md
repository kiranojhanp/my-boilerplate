# 🎯 Features Directory

This directory contains all business logic organized by feature.

## Structure
Each feature follows this pattern:
- `types.ts` - All TypeScript types and Zod schemas
- `backend.ts` - Server-side logic (service + API routes)  
- `frontend.tsx` - Client-side code (components + hooks)
- `routes.tsx` - Feature-specific routes

## Usage
```typescript
// Import feature functionality
import { TodoService } from '@/features/todo/backend'
import { TodoDashboard } from '@/features/todo/frontend'
import type { Todo } from '@/features/todo/types'
```
