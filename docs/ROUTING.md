# Scalable Routing System

This routing system provides a modular, scalable way to manage routes in your React Router application.

## Architecture

The routing system is organized into several key parts:

### 1. Types (`shared/types/routes.ts`)

- `RouteConfig`: Type alias for React Router's RouteObject
- `FeatureRoutes`: Interface for grouping routes by feature
- `RouteMetadata`: Metadata for navigation and route information

### 2. Feature Routes

Each feature defines its own routes in a `routes.tsx` file:

```tsx
// features/my-feature/routes.tsx
import React from "react";
import type { RouteConfig, RouteMetadata } from "../../shared/types/routes";
import { MyFeature } from "./index";

export const myFeatureRouteMetadata: RouteMetadata[] = [
  {
    title: "My Feature",
    path: "/my-feature",
    showInNav: true,
    description: "Description of my feature",
  },
];

export const myFeatureRoutes: RouteConfig[] = [
  {
    path: "my-feature",
    element: <MyFeature />,
  },
];
```

### 3. Route Registry (`router/registry.ts`)

Central registry that collects and manages all feature routes.

### 4. Layouts (`router/layouts.tsx`)

Reusable layout components for different parts of the application.

## Adding a New Feature

To add a new feature with routes:

1. **Create the feature component:**

   ```tsx
   // features/users/index.tsx
   export function Users() {
     return <div>Users Feature</div>;
   }
   ```

2. **Define the routes:**

   ```tsx
   // features/users/routes.tsx
   import React from "react";
   import type { RouteConfig, RouteMetadata } from "../../shared/types/routes";
   import { Users } from "./index";

   export const usersRouteMetadata: RouteMetadata[] = [
     {
       title: "Users",
       path: "/users",
       showInNav: true,
       description: "User management",
     },
   ];

   export const usersRoutes: RouteConfig[] = [
     {
       path: "users",
       element: <Users />,
     },
   ];
   ```

3. **Register the feature in the registry:**

   ```tsx
   // router/registry.ts
   import { usersRoutes, usersRouteMetadata } from "../features/users/routes";

   const featureRoutes: FeatureRoutes[] = [
     // ...existing features
     {
       name: "users",
       routes: usersRoutes,
     },
   ];

   export const allRouteMetadata: RouteMetadata[] = [
     // ...existing metadata
     ...usersRouteMetadata,
   ];
   ```

That's it! Your new feature is now automatically:

- Added to the router
- Included in navigation (if `showInNav: true`)
- Available at the specified path

## Benefits

### ✅ Scalable

- Easy to add new features without touching main router file
- Each feature manages its own routes
- No route conflicts or merge issues

### ✅ Type Safe

- Full TypeScript support
- Route metadata is typed
- Compile-time route validation

### ✅ Maintainable

- Clear separation of concerns
- Routes are co-located with features
- Easy to find and modify routes

### ✅ Flexible

- Support for nested routes
- Route metadata for navigation
- Custom layouts per feature

### ✅ Consistent

- Standardized route definition pattern
- Automatic navigation generation
- Centralized route management

## Advanced Usage

### Nested Routes

```tsx
export const featureRoutes: RouteConfig[] = [
  {
    path: "users",
    element: <UsersLayout />,
    children: [
      {
        index: true,
        element: <UsersList />,
      },
      {
        path: ":id",
        element: <UserDetail />,
      },
      {
        path: ":id/edit",
        element: <UserEdit />,
      },
    ],
  },
];
```

### Protected Routes

```tsx
export const adminRouteMetadata: RouteMetadata[] = [
  {
    title: "Admin",
    path: "/admin",
    showInNav: true,
    requiresAuth: true, // Custom metadata
    description: "Admin panel",
  },
];
```

### Dynamic Route Generation

The registry provides utility functions:

- `getRoutesByFeature(name)`: Get routes for a specific feature
- `getNavigationRoutes()`: Get routes that should show in navigation
- `mergeFeatureRoutes()`: Combine all feature routes

This system makes it incredibly easy to scale your application's routing as it grows!
