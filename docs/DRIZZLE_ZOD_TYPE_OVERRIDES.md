# Drizzle-Zod Type Override Documentation

## Problem: $type<T>() Modifiers Not Recognized

When using Drizzle's `$type<T>()` modifier to override the TypeScript type of a column, drizzle-zod does not automatically pick up this type annotation. This creates a disconnect between your intended types and the auto-generated Zod schemas.

### Example Problem

```typescript
// In Drizzle schema
export const todos = sqliteTable("todos", {
  // ... other fields
  tags: text("tags", { mode: "json" }).$type<string[]>(),
});
```

**Expected**: drizzle-zod should generate `z.array(z.string())` for the tags field
**Actual**: drizzle-zod generates `z.unknown()` or `Json` type, ignoring the `$type<string[]>()` annotation

### Impact

This causes TypeScript compilation errors throughout your application:

- Database insert/update operations fail with type mismatches
- Frontend forms can't properly validate the expected array type
- API responses don't match the expected type contracts

## Solution: Manual Type Overrides

When drizzle-zod doesn't recognize `$type<T>()` modifiers, you need to manually override the specific fields in your auto-generated schemas.

### Implementation

```typescript
// 1. Generate base schemas from Drizzle
export const TodoSelectSchema = createSelectSchema(todos);
export const TodoInsertSchema = createInsertSchema(todos);

// 2. Override problematic fields with correct types
export const TodoSelectSchemaFixed = TodoSelectSchema.extend({
  tags: z.array(z.string()).nullable(),
});

export const TodoInsertSchemaFixed = TodoInsertSchema.extend({
  tags: z.array(z.string()).nullable(),
});

// 3. Use the fixed schemas throughout your application
export type Todo = z.infer<typeof TodoSelectSchemaFixed>;
```

### Fields That Commonly Need Overrides

1. **JSON fields with $type<T>()**:

   ```typescript
   tags: text("tags", { mode: "json" }).$type<string[]>();
   // Needs: z.array(z.string())
   ```

2. **Custom type assertions**:

   ```typescript
   metadata: text("metadata", { mode: "json" }).$type<Record<string, any>>();
   // Needs: z.record(z.unknown())
   ```

3. **Union types**:
   ```typescript
   status: text("status").$type<"draft" | "published" | "archived">();
   // Needs: z.enum(["draft", "published", "archived"])
   ```

## Best Practices

### 1. Keep Overrides Minimal

Only override fields that actually need it. Let drizzle-zod handle the rest automatically.

```typescript
// ✅ Good - only override what's necessary
export const TodoSelectSchemaFixed = TodoSelectSchema.extend({
  tags: z.array(z.string()).nullable(),
});

// ❌ Bad - manually redefining everything
export const TodoSelectSchemaManual = z.object({
  id: z.string(),
  title: z.string(),
  // ... manually defining all fields
});
```

### 2. Document Why Overrides Are Needed

```typescript
// Override tags field because drizzle-zod doesn't recognize $type<string[]>() modifier
export const TodoSelectSchemaFixed = TodoSelectSchema.extend({
  tags: z.array(z.string()).nullable(), // Drizzle: text("tags", { mode: "json" }).$type<string[]>()
});
```

### 3. Use Type Checks to Catch Mismatches

```typescript
// Verify that your override matches the Drizzle type
type DrizzleTodo = typeof todos.$inferSelect;
type ZodTodo = z.infer<typeof TodoSelectSchemaFixed>;

// This should not error - if it does, your override is wrong
const _typeCheck: ZodTodo = {} as DrizzleTodo;
```

### 4. Group Overrides Together

```typescript
// ========================================
// TYPE OVERRIDES (due to drizzle-zod limitations)
// ========================================

// Base auto-generated schemas
export const TodoSelectSchemaBase = createSelectSchema(todos);
export const TodoInsertSchemaBase = createInsertSchema(todos);

// Fixed schemas with manual overrides
export const TodoSelectSchema = TodoSelectSchemaBase.extend({
  tags: z.array(z.string()).nullable(), // $type<string[]>() not recognized
});

export const TodoInsertSchema = TodoInsertSchemaBase.extend({
  tags: z.array(z.string()).nullable(), // $type<string[]>() not recognized
});
```

## Future Considerations

This issue may be resolved in future versions of drizzle-zod. Monitor these resources:

1. **drizzle-zod GitHub Issues**: Check for updates on `$type<T>()` support
2. **Drizzle ORM Releases**: New versions may improve type inference
3. **Alternative Solutions**: Consider other schema generation tools if this becomes a blocker

## Testing Your Overrides

Always verify that your type overrides work correctly:

```typescript
// 1. TypeScript compilation should pass
npm run type-check

// 2. Runtime validation should work
const validTodo = TodoSelectSchema.parse({
  id: "1",
  title: "Test",
  tags: ["work", "urgent"], // Should validate as string[]
});

// 3. Database operations should work
await db.insert(todos).values({
  title: "Test",
  tags: ["work", "urgent"], // Should insert correctly
});
```

## Conclusion

While drizzle-zod is excellent for auto-generating Zod schemas from Drizzle schemas, the `$type<T>()` limitation requires manual intervention. By following these patterns, you can maintain type safety while still benefiting from auto-generation for the majority of your schema.

The key is to:

1. Use auto-generation as much as possible
2. Override only what's necessary
3. Document why overrides are needed
4. Test thoroughly to ensure type safety
