# 🖥️ Backend Infrastructure

Global server setup and utilities.

## Files
- `main.ts` - Server entry point
- `database.ts` - Database connection + global schemas
- `trpc.ts` - tRPC setup + middleware
- `utils.ts` - Server utilities (logger, etc.)

## Usage
```typescript
import { db } from '@/backend/database'
import { logger } from '@/backend/utils'
```
