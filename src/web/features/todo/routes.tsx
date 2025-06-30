import React, { lazy, Suspense } from "react";
import type { RouteConfig, RouteMetadata } from "@/web/shared/types/routes";
import { LoadingSpinner } from "@/web/shared/components/LoadingSpinner";

// Lazy load components for code splitting
const TodoDashboard = lazy(() =>
  import("./components/TodoDashboard").then((m) => ({
    default: m.TodoDashboard,
  }))
);

// Wrapper component for Suspense
const LazyTodoDashboard = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <TodoDashboard />
  </Suspense>
);

// Route metadata for navigation
export const todoRouteMetadata: RouteMetadata[] = [
  {
    title: "Dashboard",
    path: "/",
    showInNav: true,
    description: "Main todo dashboard",
  },
  {
    title: "All Todos",
    path: "/todos",
    showInNav: true,
    description: "View all todos",
  },
];

// Todo feature routes
export const todoRoutes: RouteConfig[] = [
  {
    index: true,
    element: <LazyTodoDashboard />,
  },
  {
    path: "todos",
    element: <LazyTodoDashboard />,
  },
  // Future todo-related routes can be added here
  // {
  //   path: "todos/:id",
  //   element: <TodoDetail />,
  // },
  // {
  //   path: "todos/:id/edit",
  //   element: <TodoEdit />,
  // },
];
